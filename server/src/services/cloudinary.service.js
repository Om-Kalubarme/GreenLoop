import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if credentials are provided in environment
const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud'
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload image buffer to Cloudinary or fallback to local disk storage
 * @param {Object} file - Multer file object
 * @returns {Promise<{ imageUrl: string, publicId: string }>}
 */
export const uploadImageFile = async (file) => {
  if (!file) {
    throw new Error('No image file provided');
  }

  // 1. If Cloudinary is configured, upload via upload_stream
  if (isConfigured) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'greenloop_listings',
            transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({
              imageUrl: result.secure_url,
              publicId: result.public_id,
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (err) {
      console.warn('[Cloudinary Service] Upload failed, using local storage fallback:', err.message);
    }
  }

  // 2. Reliable Local Fallback Storage
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileExt = path.extname(file.originalname) || '.jpg';
  const fileName = `listing_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFileSync(filePath, file.buffer);

  const serverPort = process.env.PORT || 5001;
  const localUrl = `http://localhost:${serverPort}/uploads/${fileName}`;

  return {
    imageUrl: localUrl,
    publicId: `local_${fileName}`,
  };
};

export default {
  uploadImageFile,
};
