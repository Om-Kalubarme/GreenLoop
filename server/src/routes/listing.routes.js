import { Router } from 'express';
import { getListings, getListingById } from '../controllers/listing.controller.js';

const router = Router();

// Public Read Endpoints
router.get('/', getListings);
router.get('/:id', getListingById);

export default router;
