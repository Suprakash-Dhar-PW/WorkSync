import axios from 'axios';

// --- API Setup ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Endpoints ---
export const authApi = {
  login: (credentials) => api.post('/login', credentials),
};

export const taskApi = {
  // Admin: Get tasks for their group
  getGroupTasks: () => api.get('/tasks/group'),

  // Admin: Get all employees to assign
  getEmployees: () => api.get('/tasks/employees'),

  // Employee: Get assigned tasks
  getMyTasks: () => api.get('/tasks/my'),

  // Admin: Create task
  createTask: (data) => api.post('/tasks', data),

  // Employee: Update status
  updateStatus: (taskId, status) =>
    api.patch(`/tasks/${taskId}/status`, { status }),
};

export default api;