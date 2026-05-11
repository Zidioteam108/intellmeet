import api from '../lib/api';

// Get current user profile using saved token
export const getMyProfile = async (token: string) => {
  const response = await api.get('/profile/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Refresh access token
export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};
