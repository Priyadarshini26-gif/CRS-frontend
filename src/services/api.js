import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Issues APIs
export const issuesAPI = {
  createIssue: (data) => api.post('/issues', data),
  getIssues: (params) => api.get('/issues', { params }),
  getIssueById: (id) => api.get(`/issues/${id}`),
  voteOnIssue: (id) => api.post(`/issues/${id}/vote`),
  getMyIssues: (params) => api.get('/issues/user/my-issues', { params })
};

// Authority APIs
export const authorityAPI = {
  getIssues: (params) => api.get('/authority/issues', { params }),
  getPrioritySorted: (params) => api.get('/authority/issues/priority/sorted', { params }),
  approveIssue: (id) => api.patch(`/authority/issues/${id}/approve`),
  rejectIssue: (id, data) => api.patch(`/authority/issues/${id}/reject`, data),
  getUserDetails: (userId) => api.get(`/authority/users/${userId}`)
};

// Govt APIs
export const govtAPI = {
  getIssues: (params) => api.get('/govt/issues', { params }),
  getStatistics: () => api.get('/govt/statistics'),
  updateStatus: (id, data) => api.patch(`/govt/issues/${id}/status`, data),
  assignIssue: (id, data) => api.patch(`/govt/issues/${id}/assign`, data)
};

export default api;
