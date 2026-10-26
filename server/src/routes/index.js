import { Router } from 'express';
import healthRoutes from './health.routes.js';

const apiRouter = Router();

// Health Check Probe
apiRouter.use('/health', healthRoutes);

export default apiRouter;
