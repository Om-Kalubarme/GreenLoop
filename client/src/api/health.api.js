import apiClient from './client.js';

export const fetchHealthStatus = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};
