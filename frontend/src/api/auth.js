import apiClient from './client.js';

export const signup = async (payload) => {
  const { data } = await apiClient.post('/api/auth/signup', payload);
  return data.data;
};

export const login = async (payload) => {
  const { data } = await apiClient.post('/api/auth/login', payload);
  return data.data;
};

export const verifyOtp = async (payload) => {
  const { data } = await apiClient.post('/api/auth/verify-otp', payload);
  return data.data;
};

export const resendOtp = async (payload) => {
  const { data } = await apiClient.post('/api/auth/resend-otp', payload);
  return data.data;
};
