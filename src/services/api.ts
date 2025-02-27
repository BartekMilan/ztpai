import axios from 'axios';

if (!process.env.REACT_APP_API_URL) {
  console.warn('REACT_APP_API_URL nie jest zdefiniowany. Używam domyślnego adresu.');
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Konfiguracja instancji axios z interceptorami
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor dla automatycznego dodawania tokenu JWT do żądań
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor dla obsługi błędów autoryzacji (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Opcjonalnie: automatyczne wylogowanie
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;