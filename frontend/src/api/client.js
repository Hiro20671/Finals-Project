import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:8000/api';
export const MEDIA_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('acadex_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // Only clear if token was present
      if (localStorage.getItem('acadex_token')) {
        localStorage.removeItem('acadex_token');
        localStorage.removeItem('acadex_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

