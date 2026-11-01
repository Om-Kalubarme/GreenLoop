import { Router } from 'express';
import { 
  getUserInterests, 
  updateInterestStatus,
  deleteInterest
} from '../controllers/interest.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Protected: Get user's sent and received interest proposals
router.get('/my', verifyToken, getUserInterests);

// Protected: Accept or decline an interest request
router.patch('/:id/status', verifyToken, updateInterestStatus);

// Protected: Cancel or delete an interest proposal (any status)
router.delete('/:id', verifyToken, deleteInterest);

export default router;
