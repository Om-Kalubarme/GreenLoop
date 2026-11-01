import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 GreenLoop API Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);

  // Verify database connectivity on startup
  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    console.log(`✅ PostgreSQL connection established (Latency: ${dbStatus.latencyMs}ms)`);
  } else {
    console.warn(`⚠️ PostgreSQL connection warning: ${dbStatus.error}`);
    console.warn(`   Run 'npm run db:migrate' after configuring PostgreSQL credentials.`);
  }
});

// Graceful shutdown
const handleShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;
