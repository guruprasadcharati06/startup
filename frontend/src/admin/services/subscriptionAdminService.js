import apiClient from '../../api/client.js';

export const getAllSubscriptions = async () => {
  const { data } = await apiClient.get('/api/subscriptions/admin');
  return data.data;
};

export const markDeliveryComplete = async (subscriptionId, dayIndex) => {
  const { data } = await apiClient.post(
    `/api/subscriptions/admin/${subscriptionId}/deliveries/${dayIndex}/delivered`
  );
  return data.data;
};
