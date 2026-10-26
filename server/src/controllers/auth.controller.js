import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'resource_ai_jwt_secure_development_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Helper: Generate signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, role, city, preferred_categories } = validatedData;

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists',
      });
    }

    // Hash password with 10 salt rounds
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const insertSql = `
      INSERT INTO users (name, email, password_hash, role, city, preferred_categories)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role, city, preferred_categories, created_at;
    `;
    const result = await query(insertSql, [
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      role,
      city.trim(),
      preferred_categories,
    ]);

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: newUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await query(
      'SELECT id, name, email, password_hash, role, city, preferred_categories, created_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    // Omit password hash in output
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

/**
 * PATCH /api/users/me
 */
export const updateMe = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const userId = req.user.id;

    const fields = [];
    const values = [];
    let idx = 1;

    if (validatedData.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(validatedData.name.trim());
    }

    if (validatedData.city !== undefined) {
      fields.push(`city = $${idx++}`);
      values.push(validatedData.city.trim());
    }

    if (validatedData.preferred_categories !== undefined) {
      fields.push(`preferred_categories = $${idx++}`);
      values.push(validatedData.preferred_categories);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid profile fields provided for update',
      });
    }

    values.push(userId);
    const updateSql = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${idx}
      RETURNING id, name, email, role, city, preferred_categories, created_at;
    `;

    const result = await query(updateSql, values);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
