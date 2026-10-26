import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';
const useSSL = process.env.DB_SSL === 'true' || (isProduction && !process.env.DATABASE_URL?.includes('localhost'));

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'resource_ai',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[Database Pool Error]: Unexpected error on idle client', err);
});

/**
 * Execute SQL query helper
 * @param {string} text - SQL query text
 * @param {Array} params - Parameter values
 */
export const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Health check helper to test database connectivity and latency
 */
export const testConnection = async () => {
  const start = Date.now();
  try {
    const res = await pool.query('SELECT 1 AS health_check');
    const latency = Date.now() - start;
    return { connected: true, latencyMs: latency };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};

export default {
  pool,
  query,
  testConnection,
};
