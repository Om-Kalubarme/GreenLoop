import { Router } from 'express';
import healthRoutes from './health.routes.js';
import listingRoutes from './listing.routes.js';

const apiRouter = Router();

// Health Check Probe
apiRouter.use('/health', healthRoutes);

// Material Listings Routes
apiRouter.use('/listings', listingRoutes);

export default apiRouter;
