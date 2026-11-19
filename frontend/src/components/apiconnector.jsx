import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ApiConnector = axios.create({
  baseURL: BASE_URL,
});

ApiConnector.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

ApiConnector.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove('auth_token');
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/signin') &&
        !currentPath.includes('/signup') &&
        currentPath !== '/'
      ) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default ApiConnector;
