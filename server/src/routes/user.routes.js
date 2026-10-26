import { Router } from 'express';
import { updateMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.patch('/me', verifyToken, updateMe);

export default router;
