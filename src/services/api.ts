import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL?.endsWith('/') 
  ? import.meta.env.VITE_API_URL.slice(0, -1) 
  : import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // If 401, the cookie is likely expired or missing.
      // Redirect to login.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
