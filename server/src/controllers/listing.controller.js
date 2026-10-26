import { query } from '../config/db.js';
import { queryListingsSchema, listingIdParamSchema } from '../validators/listing.validator.js';

/**
 * GET /api/listings
 * Fetch paginated listings with category, city, condition, and keyword search filters
 */
export const getListings = async (req, res, next) => {
  try {
    const validatedQuery = queryListingsSchema.parse(req.query);
    const { search, category, city, condition, status, page, limit } = validatedQuery;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Filter by status (default 'available')
    if (status) {
      conditions.push(`l.status = $${paramIndex++}`);
      values.push(status);
    }

    // Filter by category
    if (category) {
      conditions.push(`l.material_category = $${paramIndex++}`);
      values.push(category);
    }

    // Filter by city (case-insensitive)
    if (city) {
      conditions.push(`LOWER(l.city) = LOWER($${paramIndex++})`);
      values.push(city.trim());
    }

    // Filter by condition
    if (condition) {
      conditions.push(`l.condition = $${paramIndex++}`);
      values.push(condition);
    }

    // Text search in title or description
    if (search && search.trim()) {
      conditions.push(`(l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex} OR l.material_type ILIKE $${paramIndex})`);
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count query for pagination
    const countSql = `SELECT COUNT(*) AS total FROM listings l ${whereClause};`;
    const countRes = await query(countSql, values);
    const total = parseInt(countRes.rows[0].total, 10);

    // Paginated results query
    const offset = (page - 1) * limit;
    values.push(limit);
    values.push(offset);

    const selectSql = `
      SELECT 
        l.id,
        l.owner_id,
        l.title,
        l.material_category,
        l.material_type,
        l.condition,
        l.quantity_description,
        l.description,
        l.city,
        l.image_url,
        l.status,
        l.created_at,
        l.updated_at,
        u.name AS donor_name,
        u.city AS donor_city
      FROM listings l
      JOIN users u ON l.owner_id = u.id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const result = await query(selectSql, values);

    res.json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      listings: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/listings/:id
 * Fetch single listing details and public donor information
 */
export const getListingById = async (req, res, next) => {
  try {
    const { id } = listingIdParamSchema.parse(req.params);

    const selectSql = `
      SELECT 
        l.id,
        l.owner_id,
        l.title,
        l.material_category,
        l.material_type,
        l.condition,
        l.quantity_description,
        l.description,
        l.city,
        l.image_url,
        l.cloudinary_public_id,
        l.status,
        l.created_at,
        l.updated_at,
        u.name AS donor_name,
        u.email AS donor_email,
        u.city AS donor_city,
        u.role AS donor_role
      FROM listings l
      JOIN users u ON l.owner_id = u.id
      WHERE l.id = $1;
    `;

    const result = await query(selectSql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    res.json({
      success: true,
      listing: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
