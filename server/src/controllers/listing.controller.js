import { query } from '../config/db.js';
import { 
  queryListingsSchema, 
  listingIdParamSchema, 
  createListingSchema, 
  updateListingSchema 
} from '../validators/listing.validator.js';

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

/**
 * POST /api/listings
 * Create a new material listing (Requires authenticated donor or admin)
 */
export const createListing = async (req, res, next) => {
  try {
    const validatedData = createListingSchema.parse(req.body);
    const ownerId = req.user.id;

    // Default image if none provided
    const defaultPlaceholder = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80';
    const finalImageUrl = validatedData.image_url && validatedData.image_url.trim() !== '' 
      ? validatedData.image_url 
      : defaultPlaceholder;

    const insertSql = `
      INSERT INTO listings (
        owner_id, title, material_category, material_type, 
        condition, quantity_description, description, city, 
        image_url, cloudinary_public_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'available')
      RETURNING *;
    `;

    const result = await query(insertSql, [
      ownerId,
      validatedData.title.trim(),
      validatedData.material_category,
      validatedData.material_type.trim(),
      validatedData.condition,
      validatedData.quantity_description.trim(),
      validatedData.description.trim(),
      validatedData.city.trim(),
      finalImageUrl,
      validatedData.cloudinary_public_id || null,
    ]);

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/listings/my/listings
 * Fetch listings owned by the logged-in user
 */
export const getMyListings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const selectSql = `
      SELECT 
        l.*,
        (SELECT COUNT(*) FROM interests i WHERE i.listing_id = l.id) AS interest_count
      FROM listings l
      WHERE l.owner_id = $1
      ORDER BY l.created_at DESC;
    `;

    const result = await query(selectSql, [ownerId]);

    res.json({
      success: true,
      count: result.rowCount,
      listings: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/listings/:id
 * Update listing details or status (Requires ownership or admin)
 */
export const updateListing = async (req, res, next) => {
  try {
    const { id } = listingIdParamSchema.parse(req.params);
    const validatedData = updateListingSchema.parse(req.body);

    // Verify listing exists and ownership
    const existing = await query('SELECT owner_id FROM listings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const listing = existing.rows[0];
    if (listing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to modify this listing',
      });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(validatedData)) {
      if (val !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(typeof val === 'string' ? val.trim() : val);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields provided for update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const updateSql = `
      UPDATE listings
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const result = await query(updateSql, values);

    res.json({
      success: true,
      message: 'Listing updated successfully',
      listing: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/listings/:id
 * Archive or delete listing (Requires ownership or admin)
 */
export const deleteListing = async (req, res, next) => {
  try {
    const { id } = listingIdParamSchema.parse(req.params);

    const existing = await query('SELECT owner_id FROM listings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (existing.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to delete this listing',
      });
    }

    // Soft archive or delete: we support soft archive to maintain interest records integrity
    await query("UPDATE listings SET status = 'archived', updated_at = NOW() WHERE id = $1", [id]);

    res.json({
      success: true,
      message: 'Listing successfully archived',
    });
  } catch (err) {
    next(err);
  }
};
