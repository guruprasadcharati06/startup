import apiClient from './client.js';

export const getServices = async ({ mealType } = {}) => {
  const params = {};
  if (mealType) {
    params.mealType = mealType;
  }

  const { data } = await apiClient.get('/api/services', { params });
  return data.data;
};

export const getServiceById = async (id) => {
  try {
    const { data } = await apiClient.get(`/api/services/${id}`);
    return data.data;
  } catch (error) {
    // Fallback for backends without an explicit show route
    const services = await getServices();
    return services.find((service) => service._id === id);
  }
};
