import apiClient from '../../api/client.js';

export const getAdminOrders = async ({ status, paymentMethod, limit } = {}) => {
  const params = new URLSearchParams();

  if (status) params.set('status', status);
  if (paymentMethod) params.set('paymentMethod', paymentMethod);
  if (limit) params.set('limit', limit);

  const query = params.toString();
  const url = query ? `/api/orders/admin?${query}` : '/api/orders/admin';

  const { data } = await apiClient.get(url);
  return data.data;
};

export const markOrderCodPaid = async (orderId) => {
  const { data } = await apiClient.patch(`/api/orders/admin/${orderId}/cod-settle`);
  return data.data;
};
