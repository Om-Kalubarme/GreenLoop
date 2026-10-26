import apiClient from './client.js';

export const fetchListings = async (params = {}) => {
  const response = await apiClient.get('/listings', { params });
  return response.data;
};

export const fetchListingById = async (id) => {
  const response = await apiClient.get(`/listings/${id}`);
  return response.data;
};

export const createListing = async (listingData) => {
  const response = await apiClient.post('/listings', listingData);
  return response.data;
};

export const updateListing = async (id, updateData) => {
  const response = await apiClient.patch(`/listings/${id}`, updateData);
  return response.data;
};

export const deleteListing = async (id) => {
  const response = await apiClient.delete(`/listings/${id}`);
  return response.data;
};

export const fetchMyListings = async () => {
  const response = await apiClient.get('/listings/my/listings');
  return response.data;
};

export const uploadListingImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
