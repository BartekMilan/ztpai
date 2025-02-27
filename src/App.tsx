import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TasksPage from './pages/TasksPage';
import UserProfilePage from './pages/UserProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import useLocalStorage from './hooks/useLocalStorage';

function App() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#0052CC', // Jira blue
        light: '#4C9AFF',
        dark: '#0747A6',
      },
      secondary: {
        main: '#00875A', // Jira green
        light: '#57D9A3',
        dark: '#006644',
      },
      error: {
        main: '#DE350B', // Jira red
        light: '#FF5630',
        dark: '#BF2600',
      },
      warning: {
        main: '#FF8B00', // Jira orange
        light: '#FFB366',
        dark: '#CC6D00',
      },
      info: {
        main: '#0065FF', // Jira light blue
        light: '#4C9AFF',
        dark: '#0747A6',
      },
      success: {
        main: '#006644', // Jira dark green
        light: '#00B8D9',
        dark: '#006644',
      },
      background: {
        default: darkMode ? '#1B1B1B' : '#FAFBFC',
        paper: darkMode ? '#2C2C2C' : '#FFFFFF',
      },
      grey: {
        50: '#F4F5F7',
        100: '#EBECF0',
        200: '#DFE1E6',
        300: '#C1C7D0',
        400: '#A5ADBA',
        500: '#6B778C',
        600: '#505F79',
        700: '#344563',
        800: '#172B4D',
        900: '#091E42',
      },
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      h1: {
        fontSize: '2.125rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '1.875rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '0.875rem',
      },
      body2: {
        fontSize: '0.75rem',
      },
    },
    shape: {
      borderRadius: 3,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 0 0 1px rgba(255, 255, 255, 0.1)' 
              : '0 0 0 1px rgba(9, 30, 66, 0.08)',
          },
        },
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div className="App">
              <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              <Routes>
                <Route path="/" element={<Navigate to="/tasks" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <TasksPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
