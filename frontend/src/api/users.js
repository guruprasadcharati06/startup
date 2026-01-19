import apiClient from './client.js';

export const getProfile = async () => {
  const { data } = await apiClient.get('/api/users/profile');
  return data.data;
};

export const updateProfile = async (payload) => {
  const { data } = await apiClient.put('/api/users/profile', payload);
  return data.data;
};
