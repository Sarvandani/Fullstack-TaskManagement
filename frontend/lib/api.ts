import axios from 'axios';
import type { User, Project, Task, Comment, File, Analytics } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Check both localStorage (remember me) and sessionStorage (session only)
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  demo: async () => {
    const response = await api.post('/auth/demo');
    return response.data;
  },
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },
  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  create: async (data: { name: string; description?: string; color?: string }): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
  addMember: async (projectId: string, userId: string, role: string): Promise<ProjectMember> => {
    const response = await api.post(`/projects/${projectId}/members`, { userId, role });
    return response.data;
  },
  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (params?: {
    projectId?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
  }): Promise<Task[]> => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  create: async (data: Partial<Task>): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
  reorder: async (projectId: string, tasks: Array<{ id: string; position: number }>): Promise<void> => {
    await api.put(`/tasks/${projectId}/reorder`, { tasks });
  },
  addComment: async (taskId: string, content: string): Promise<Comment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },
};

// Files API
export const filesAPI = {
  upload: async (file: globalThis.File, projectId?: string, taskId?: string): Promise<File> => {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('projectId', projectId);
    if (taskId) formData.append('taskId', taskId);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAll: async (params?: { projectId?: string; taskId?: string }): Promise<File[]> => {
    const response = await api.get('/files', { params });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },
};

// Users API
export const usersAPI = {
  getAll: async (search?: string): Promise<User[]> => {
    const response = await api.get('/users', { params: { search } });
    return response.data;
  },
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async (): Promise<Analytics> => {
    const response = await api.get('/analytics');
    return response.data;
  },
  getProjectAnalytics: async (projectId: string) => {
    const response = await api.get(`/analytics/project/${projectId}`);
    return response.data;
  },
  getAssignees: async () => {
    const response = await api.get('/analytics/assignees');
    return response.data;
  },
};

export default api;
