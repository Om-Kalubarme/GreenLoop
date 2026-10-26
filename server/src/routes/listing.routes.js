import { Router } from 'express';
import { 
  getListings, 
  getListingById, 
  createListing, 
  updateListing, 
  deleteListing, 
  getMyListings 
} from '../controllers/listing.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public Read Endpoints
router.get('/', getListings);

// Protected: Get listings owned by logged in donor (placed before /:id)
router.get('/my/listings', verifyToken, getMyListings);

// Public Read Single Listing
router.get('/:id', getListingById);

// Protected: Create Listing (Donor or Admin only)
router.post('/', verifyToken, requireRole('donor', 'admin'), createListing);

// Protected: Update Listing (Owner or Admin)
router.patch('/:id', verifyToken, updateListing);

// Protected: Delete / Archive Listing (Owner or Admin)
router.delete('/:id', verifyToken, deleteListing);

export default router;
