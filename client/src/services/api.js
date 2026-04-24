import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (email, password, name) =>
  api.post('/auth/register', { email, password, name });

// Generic CRUD factory functions
export const getAll = (endpoint) => api.get(`/${endpoint}`);

export const getById = (endpoint, id) => api.get(`/${endpoint}/${id}`);

export const create = (endpoint, data) => api.post(`/${endpoint}`, data);

export const update = (endpoint, id, data) =>
  api.put(`/${endpoint}/${id}`, data);

export const deleteItem = (endpoint, id) => api.delete(`/${endpoint}/${id}`);

export const analyzeWithAI = (endpoint, id) =>
  api.post(`/${endpoint}/${id}/analyze`);

export const queryAI = (endpoint, prompt, context) =>
  api.post(`/${endpoint}/ai/query`, { prompt, context });

// Enhanced list with search/filter/sort/pagination
export const getFiltered = (endpoint, params) => api.get(`/${endpoint}`, { params });

// Export
export const exportJSON = (endpoint, params) => api.get(`/${endpoint}/export`, { params, responseType: 'blob' });
export const exportCSV = (endpoint, params) => api.get(`/${endpoint}/export/csv`, { params, responseType: 'blob' });

// Import
export const importItems = (endpoint, items) => api.post(`/${endpoint}/import`, { items });

// Bulk operations
export const bulkDelete = (endpoint, ids) => api.post(`/${endpoint}/bulk/delete`, { ids });
export const bulkUpdate = (endpoint, ids, updates) => api.post(`/${endpoint}/bulk/update`, { ids, updates });

// Duplicate
export const duplicateItem = (endpoint, id) => api.post(`/${endpoint}/${id}/duplicate`);

// Stats
export const getStats = (endpoint) => api.get(`/${endpoint}/stats`);
export const getDashboardStats = () => api.get('/dashboard/stats');

// User profile
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.put('/auth/profile/password', data);

export default api;
