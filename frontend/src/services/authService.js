import api from './api';

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  localStorage.setItem('news_token', response.data.token);
  localStorage.setItem('news_user', JSON.stringify(response.data.user));
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('news_token');
  localStorage.removeItem('news_user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('news_user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => Boolean(localStorage.getItem('news_token'));
