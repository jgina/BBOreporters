import api from './api';

export const fetchPosts = (params) => api.get('/posts', { params });
export const fetchPostBySlug = (slug) => api.get(`/posts/${slug}`);
export const fetchPostForEdit = (id) => api.get(`/posts/manage/${id}`);
export const createPost = (data) => api.post('/posts', data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
