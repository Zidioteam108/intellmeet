import api from '../lib/api';

// Get current user profile using saved token
export const getMyProfile = async (token: string) => {
  // We pass token to the store which then gets picked up by the interceptor
  // or we can just let the interceptor handle it if the store is already set.
  const response = await api.get('/profile/me');
  return response.data;
};

// Refresh access token
export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};
