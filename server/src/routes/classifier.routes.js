import { Router } from 'express';
import multer from 'multer';
import { getClassifierInfo, predictWasteCategory } from '../controllers/classifier.controller.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// GET /api/classifier/info - Information about the 4 categories
router.get('/info', getClassifierInfo);

// POST /api/classifier/predict - Classify an uploaded image or image URL
router.post('/predict', upload.single('image'), predictWasteCategory);

export default router;
