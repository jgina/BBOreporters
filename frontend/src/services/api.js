import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

console.log('API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('news_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token sent:', token.substring(0, 20) + '...');
  } else {
    console.log('No token found in localStorage');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - Token invalid or expired');
      localStorage.removeItem('news_token');
      localStorage.removeItem('news_user');
    }
    return Promise.reject(error);
  }
);

export default api;
