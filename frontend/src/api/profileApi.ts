import api from '../lib/api';

export const updateProfile = async (data: { name: string; bio?: string }) => {
  const response = await api.put('/profile/update', data);
  return response.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get('/profile/me');
  return response.data;
};
