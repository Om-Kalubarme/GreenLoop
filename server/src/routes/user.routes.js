import { Router } from 'express';
import { updateMe, changePassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.patch('/me', verifyToken, updateMe);
router.post('/change-password', verifyToken, changePassword);

export default router;
