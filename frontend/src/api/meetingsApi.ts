import api from '../lib/api';

export const getAllMeetings = async () => {
  // The interceptor in lib/api.ts automatically adds the 'Bearer token' 
  // from localStorage, so we don't need manual headers here.
  const res = await api.get('/meetings');
  return res.data;
};

export const createMeeting = async (data: { title: string; description?: string }) => {
  const res = await api.post('/meetings', data);
  return res.data;
};

export const deleteMeeting = async (id: string) => {
  const res = await api.delete(`/meetings/${id}`);
  return res.data;
};

export const joinMeeting = async (roomId: string) => {
  const res = await api.get(`/meetings/join/${roomId}`);
  return res.data;
};
