import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const tokenKey = `${(import.meta.env.VITE_APP_NAME || 'devtrackr').toLowerCase()}_token`;

// Request interceptor to dynamically inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth failures globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and reload/redirect if unauthorized
      localStorage.removeItem(tokenKey);
      // Dispatch custom event to signal logout to state providers
      window.dispatchEvent(new Event('auth_session_expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
