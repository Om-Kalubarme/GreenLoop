import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/auth.middleware.js';
import { uploadImageFile } from '../services/cloudinary.service.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed (max 5MB)'));
    }
  },
});

router.post('/image', verifyToken, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file (field name: image)',
      });
    }

    const uploadResult = await uploadImageFile(req.file);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: uploadResult.imageUrl,
      publicId: uploadResult.publicId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
