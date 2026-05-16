import api from '../lib/api';

export const getAllMeetings = async () => {
  const res = await api.get('/meetings');
  return res.data;
};

export const createMeeting = async (data: {
  title: string;
  description?: string;
  scheduledFor?: string;   // ISO string — optional scheduled start time
  scheduledEndAt?: string; // ISO string — optional scheduled end time
}) => {
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

export const endMeeting = async (roomId: string) => {
  const res = await api.post(`/meetings/end/${roomId}`);
  return res.data;
};

export const getMeetingById = async (id: string) => {
  const res = await api.get(`/meetings/${id}`);
  return res.data;
};
