import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

const getAuthHeader = () => ({
  Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
});

export const getTasks = async () => {
  const res = await api.get('/api/tasks', { headers: getAuthHeader() });
  return res.data;
};

export const createTask = async (data: any) => {
  const res = await api.post('/api/tasks', data, { headers: getAuthHeader() });
  return res.data;
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  const res = await api.patch(`/api/tasks/${taskId}/status`, { status }, { headers: getAuthHeader() });
  return res.data;
};

export const deleteTask = async (taskId: string) => {
  const res = await api.delete(`/api/tasks/${taskId}`, { headers: getAuthHeader() });
  return res.data;
};
