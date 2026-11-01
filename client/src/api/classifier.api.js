import apiClient from './client';

/**
 * Fetch 4-class classifier guidelines, categories, and metrics
 */
export const getClassifierInfo = async () => {
  const response = await apiClient.get('/classifier/info');
  return response.data;
};

/**
 * Classify a product or waste item into 4 categories:
 * - Hazardous
 * - Non-Recyclable
 * - Organic
 * - Recyclable
 *
 * @param {File|string} image - A File object, base64 data URI, or relative/absolute URL
 */
export const classifyImage = async (image) => {
  if (image instanceof File || image instanceof Blob) {
    const formData = new FormData();
    formData.append('image', image);
    const response = await apiClient.post('/classifier/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // String payload (base64 data URI or image URL)
  const payload = image.startsWith('data:')
    ? { image_base64: image }
    : { image_url: image };

  const response = await apiClient.post('/classifier/predict', payload);
  return response.data;
};
