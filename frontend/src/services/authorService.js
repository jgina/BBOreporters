import api from './api';

export const fetchAuthors = () => api.get('/authors');
export const fetchAuthorBySlug = (slug) => api.get(`/authors/${slug}`);
export const fetchAuthorsForAdmin = () => api.get('/authors/manage/all');
export const createAuthor = (data) => api.post('/authors', data);
export const updateAuthor = (id, data) => api.put(`/authors/${id}`, data);
export const deleteAuthor = (id) => api.delete(`/authors/${id}`);
