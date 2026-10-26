import { Router } from 'express';
import { testConnection } from '../config/db.js';
import axios from 'axios';

const router = Router();

router.get('/', async (req, res) => {
  const dbHealth = await testConnection();

  // Test optional matcher service status with short 500ms timeout
  let matcherStatus = 'offline';
  try {
    const matcherUrl = process.env.MATCHER_SERVICE_URL || 'http://localhost:8000';
    const matcherRes = await axios.get(`${matcherUrl}/health`, { timeout: 600 });
    if (matcherRes.status === 200) {
      matcherStatus = 'online';
    }
  } catch (err) {
    matcherStatus = 'offline (rule-based fallback active)';
  }

  const isHealthy = dbHealth.connected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'ReSource AI Backend API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbHealth,
    matcherService: matcherStatus,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
