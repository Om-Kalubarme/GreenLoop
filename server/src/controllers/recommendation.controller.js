import { getRecommendationsForUser } from '../services/recommendation.service.js';

/**
 * GET /api/recommendations
 * Fetch content-based and rule-ranked recommendations for logged-in user
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const user = req.user;
    const topN = parseInt(req.query.limit || '10', 10);

    const result = await getRecommendationsForUser(user, topN);

    res.json(result);
  } catch (err) {
    next(err);
  }
};
