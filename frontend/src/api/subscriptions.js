import apiClient from './client.js';

export const getMySubscription = async () => {
  const { data } = await apiClient.get('/api/subscriptions/my');
  return data.data;
};

export const createSubscription = async (payload) => {
  const { data } = await apiClient.post('/api/subscriptions/create', payload);
  return data.data;
};
