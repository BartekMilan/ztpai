import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types/task';
import authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.token) {
        setUser(response.user);
        setToken(response.token);
        return;
      }
      
      throw new Error('Login failed');
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Login failed');
    }
  };

  const register = async (username: string, email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await authService.register({
        username,
        email,
        password,
        firstName,
        lastName
      });
      
      if (response.success && response.token) {
        setUser(response.user);
        setToken(response.token);
        return;
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Error during registration:', error);
      throw new Error('Registration failed');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        avatar: data.avatar
      };
      
      const response = await authService.updateProfile(updateData);
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return;
      }
      
      throw new Error('Profile update failed');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Profile update failed');
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    updateProfile,
    logout,
    isAuthenticated: !!token,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};