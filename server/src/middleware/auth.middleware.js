import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'greenloop_jwt_secure_development_secret_key_2026';

/**
 * Middleware: Verify JWT Bearer Token
 * Attaches authenticated user object to `req.user`
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing or invalid',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Session expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token',
      });
    }

    // Verify user exists in database
    const userRes = await query(
      'SELECT id, name, email, role, city, preferred_categories, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User account no longer exists',
      });
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware: Restrict access to specific user roles
 * @param {...string} allowedRoles - e.g. 'donor', 'admin'
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};
