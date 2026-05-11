import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

// Helper to get auth header
const getAuthHeader = () => {
  const token = useAuthStore.getState().accessToken;
  return { Authorization: `Bearer ${token}` };
};

export const getAllMeetings = async () => {
  const res = await api.get('/meetings', { headers: getAuthHeader() });
  return res.data;
};

export const createMeeting = async (data: { title: string; description?: string }) => {
  const res = await api.post('/meetings', data, { headers: getAuthHeader() });
  return res.data;
};

export const deleteMeeting = async (id: string) => {
  const res = await api.delete(`/meetings/${id}`, { headers: getAuthHeader() });
  return res.data;
};
