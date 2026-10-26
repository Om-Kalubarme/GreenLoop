import apiClient from './client.js';

export const submitInterest = async (listingId, message) => {
  const response = await apiClient.post(`/listings/${listingId}/interests`, { message });
  return response.data;
};

export const fetchInterestsForListing = async (listingId) => {
  const response = await apiClient.get(`/listings/${listingId}/interests`);
  return response.data;
};

export const fetchUserInterests = async () => {
  const response = await apiClient.get('/interests/my');
  return response.data;
};

export const updateInterestStatus = async (interestId, status) => {
  const response = await apiClient.patch(`/interests/${interestId}/status`, { status });
  return response.data;
};
