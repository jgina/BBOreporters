import api from './api';

export const fetchAdminStats = () => api.get('/admin/stats');
