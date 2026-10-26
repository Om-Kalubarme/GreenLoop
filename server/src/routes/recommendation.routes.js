import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendation.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Protected: Get explainable recommendations for authenticated user
router.get('/', verifyToken, getRecommendations);

export default router;
