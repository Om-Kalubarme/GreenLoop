import api from './client';

/**
 * Fetch personalized content-based and rule-based recommendations for authenticated recipient
 * @param {number} topN - Maximum number of recommendations to return (default: 10)
 * @returns {Promise<{success: boolean, engine: string, count: number, recommendations: Array}>}
 */
export const getRecommendations = async (topN = 10) => {
  const response = await api.get('/recommendations', {
    params: { top_n: topN },
  });
  return response.data;
};

export default {
  getRecommendations,
};
