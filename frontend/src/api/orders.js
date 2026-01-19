import apiClient from './client.js';

export const createOrder = async ({
  serviceId,
  notes,
  deliveryLocation,
  mealType,
  customItemName,
  amount,
  deliveryDetails,
  itemsTotal,
  cartItems,
}) => {
  const payload = {
    ...(serviceId && { serviceId }),
    ...(notes && { notes }),
    ...(deliveryLocation && { deliveryLocation }),
    ...(mealType && { mealType }),
    ...(customItemName && { customItemName }),
    ...(typeof amount === 'number' && { amount }),
    ...(typeof itemsTotal === 'number' && { itemsTotal }),
    ...(deliveryDetails && { deliveryDetails }),
    ...(Array.isArray(cartItems) && cartItems.length > 0 && { cartItems }),
  };

  const { data } = await apiClient.post('/api/orders', payload);
  return data.data;
};

export const getOrders = async () => {
  const { data } = await apiClient.get('/api/orders');
  return data.data;
};

export const estimateDelivery = async (payload) => {
  const { data } = await apiClient.post('/api/orders/estimate-delivery', payload);
  return data.data;
};
