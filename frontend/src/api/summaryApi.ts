import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

const getAuthHeader = () => ({
  Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
});

export const getMeetingSummary = async (meetingId: string) => {
  const res = await api.get(`/api/summary/${meetingId}`, { headers: getAuthHeader() });
  return res.data;
};

export const generateSummary = async (meetingId: string) => {
  const res = await api.post(`/api/summary/${meetingId}/generate`, {}, { headers: getAuthHeader() });
  return res.data;
};

export const toggleActionItem = async (meetingId: string, itemId: string) => {
  const res = await api.patch(
    `/api/summary/${meetingId}/action-items/${itemId}/toggle`,
    {},
    { headers: getAuthHeader() }
  );
  return res.data;
};
