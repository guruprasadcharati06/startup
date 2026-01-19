import apiClient from '../../api/client.js';

export const getRecentSignups = async ({ limit = 10, days = 7 } = {}) => {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (days) params.set('days', days);

  const { data } = await apiClient.get(`/api/users/admin/recent-signups?${params.toString()}`);
  return data.data;
};
