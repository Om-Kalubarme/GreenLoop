import { Router } from 'express';
import { 
  getUserInterests, 
  updateInterestStatus 
} from '../controllers/interest.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Protected: Get user's sent and received interest proposals
router.get('/my', verifyToken, getUserInterests);

// Protected: Accept or decline an interest request
router.patch('/:id/status', verifyToken, updateInterestStatus);

export default router;
