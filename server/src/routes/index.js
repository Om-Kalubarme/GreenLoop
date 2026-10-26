import { Router } from 'express';
import healthRoutes from './health.routes.js';
import listingRoutes from './listing.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import uploadRoutes from './upload.routes.js';
import interestRoutes from './interest.routes.js';
import recommendationRoutes from './recommendation.routes.js';

const apiRouter = Router();

// Health Check Probe
apiRouter.use('/health', healthRoutes);

// Authentication & Identity
apiRouter.use('/auth', authRoutes);

// User Profile Management
apiRouter.use('/users', userRoutes);

// Material Listings Routes
apiRouter.use('/listings', listingRoutes);

// Media / Image Upload Pipeline
apiRouter.use('/uploads', uploadRoutes);

// Interest Requests Pipeline
apiRouter.use('/interests', interestRoutes);

// AI Recommendation Engine
apiRouter.use('/recommendations', recommendationRoutes);

export default apiRouter;
