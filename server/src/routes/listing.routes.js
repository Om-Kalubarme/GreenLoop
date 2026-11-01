import { Router } from 'express';
import { 
  getListings, 
  getListingById, 
  createListing, 
  updateListing, 
  deleteListing, 
  getMyListings,
  getDonorSalesAnalytics
} from '../controllers/listing.controller.js';
import { 
  createInterest, 
  getInterestsForListing 
} from '../controllers/interest.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public Read Endpoints
router.get('/', getListings);

// Protected: Get listings owned by logged in donor (placed before /:id)
router.get('/my/listings', verifyToken, getMyListings);

// Protected: Get donor month-wise sales analytics (Donor only, placed before /:id)
router.get('/my/sales-analytics', verifyToken, requireRole('donor', 'admin'), getDonorSalesAnalytics);

// Public Read Single Listing
router.get('/:id', getListingById);

// Protected: Create Listing (Donor or Admin only)
router.post('/', verifyToken, requireRole('donor', 'admin'), createListing);

// Protected: Update Listing (Owner or Admin)
router.patch('/:id', verifyToken, updateListing);

// Protected: Delete / Archive Listing (Owner or Admin)
router.delete('/:id', verifyToken, deleteListing);

// Interests nested under listings
router.post('/:id/interests', verifyToken, createInterest);
router.get('/:id/interests', verifyToken, getInterestsForListing);

export default router;
