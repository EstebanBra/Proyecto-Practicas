import axios from 'axios';
import cookies from 'js-cookie';

// Usa proxy de Vite en desarrollo; permite override con VITE_BASE_URL
const API_URL = import.meta.env.VITE_BASE_URL || '/api';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = cookies.get('jwt-auth', { path: '/' });
    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;