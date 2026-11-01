import apiClient from './client.js';

export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await apiClient.patch('/users/me', profileData);
  return response.data;
};

export const changeUserPassword = async (passwordData) => {
  const response = await apiClient.post('/users/change-password', passwordData);
  return response.data;
};

export const oauthLoginUser = async (oauthData) => {
  const response = await apiClient.post('/auth/oauth-login', oauthData);
  return response.data;
};
