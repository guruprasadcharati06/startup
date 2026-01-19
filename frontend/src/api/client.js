import axios from 'axios';
import { getAnyAuthToken } from '../utils/storage.js';

const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAnyAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
