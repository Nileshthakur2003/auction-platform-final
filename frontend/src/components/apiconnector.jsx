import axios from 'axios';
import Cookies from 'js-cookie';

const ApiConnector = axios.create({
  baseURL: 'http://localhost:5001',
});

ApiConnector.interceptors.request.use(
  config => {
    const token = Cookies.get('auth_token'); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(config.headers.Authorization);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default ApiConnector;
