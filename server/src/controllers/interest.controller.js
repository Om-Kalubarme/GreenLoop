import { query } from '../config/db.js';
import { 
  createInterestSchema, 
  updateInterestStatusSchema, 
  interestIdParamSchema 
} from '../validators/interest.validator.js';
import { listingIdParamSchema } from '../validators/listing.validator.js';

/**
 * POST /api/listings/:id/interests
 * Submit an interest request for an available listing (Recipient)
 */
export const createInterest = async (req, res, next) => {
  try {
    const { id: listingId } = listingIdParamSchema.parse(req.params);
    const { message } = createInterestSchema.parse(req.body);
    const recipientId = req.user.id;

    // 1. Verify listing exists
    const listingRes = await query(
      'SELECT id, owner_id, title, status FROM listings WHERE id = $1',
      [listingId]
    );

    if (listingRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const listing = listingRes.rows[0];

    // 2. Prevent donor from expressing interest in own listing
    if (listing.owner_id === recipientId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot express interest in your own material listing',
      });
    }

    // 3. Ensure listing is currently available
    if (listing.status !== 'available') {
      return res.status(400).json({
        success: false,
        error: `Cannot express interest in an item that is currently ${listing.status}`,
      });
    }

    // 4. Insert or reject duplicate interest request
    const existing = await query(
      'SELECT id, status FROM interests WHERE listing_id = $1 AND recipient_id = $2',
      [listingId, recipientId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'You have already submitted an interest request for this listing',
        status: existing.rows[0].status,
      });
    }

    const insertSql = `
      INSERT INTO interests (listing_id, recipient_id, message, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *;
    `;
    const result = await query(insertSql, [listingId, recipientId, message.trim()]);

    res.status(201).json({
      success: true,
      message: 'Interest request successfully sent to the material donor',
      interest: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/listings/:id/interests
 * Fetch interest requests submitted for a specific listing (Owner only)
 */
export const getInterestsForListing = async (req, res, next) => {
  try {
    const { id: listingId } = listingIdParamSchema.parse(req.params);
    const userId = req.user.id;

    // Verify ownership
    const listingRes = await query('SELECT owner_id FROM listings WHERE id = $1', [listingId]);
    if (listingRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (listingRes.rows[0].owner_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only view interest requests for listings you own',
      });
    }

    const selectSql = `
      SELECT 
        i.id,
        i.listing_id,
        i.recipient_id,
        i.message,
        i.status,
        i.created_at,
        u.name AS recipient_name,
        u.email AS recipient_email,
        u.city AS recipient_city,
        u.role AS recipient_role
      FROM interests i
      JOIN users u ON i.recipient_id = u.id
      WHERE i.listing_id = $1
      ORDER BY i.created_at DESC;
    `;

    const result = await query(selectSql, [listingId]);

    res.json({
      success: true,
      count: result.rowCount,
      interests: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/interests/my
 * Fetch all interest requests sent (as recipient) or received (as donor)
 */
export const getUserInterests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Sent interests (items recipient requested)
    const sentSql = `
      SELECT 
        i.id,
        i.listing_id,
        i.recipient_id,
        l.owner_id,
        i.message,
        i.status,
        i.created_at,
        l.title AS listing_title,
        l.material_category,
        l.quantity_description,
        l.city AS listing_city,
        l.image_url AS listing_image,
        donor.name AS donor_name,
        donor.email AS donor_email,
        donor.city AS donor_city,
        recipient.name AS recipient_name,
        recipient.email AS recipient_email,
        recipient.city AS recipient_city
      FROM interests i
      JOIN listings l ON i.listing_id = l.id
      JOIN users donor ON l.owner_id = donor.id
      JOIN users recipient ON i.recipient_id = recipient.id
      WHERE i.recipient_id = $1
      ORDER BY i.created_at DESC;
    `;
    const sentRes = await query(sentSql, [userId]);

    // Received interests (requests from other users on donor's listings)
    const receivedSql = `
      SELECT 
        i.id,
        i.listing_id,
        i.recipient_id,
        l.owner_id,
        i.message,
        i.status,
        i.created_at,
        l.title AS listing_title,
        l.material_category,
        l.quantity_description,
        l.city AS listing_city,
        l.image_url AS listing_image,
        donor.name AS donor_name,
        donor.email AS donor_email,
        donor.city AS donor_city,
        recipient.name AS recipient_name,
        recipient.email AS recipient_email,
        recipient.city AS recipient_city
      FROM interests i
      JOIN listings l ON i.listing_id = l.id
      JOIN users donor ON l.owner_id = donor.id
      JOIN users recipient ON i.recipient_id = recipient.id
      WHERE l.owner_id = $1
      ORDER BY i.created_at DESC;
    `;
    const receivedRes = await query(receivedSql, [userId]);

    res.json({
      success: true,
      sent: sentRes.rows,
      received: receivedRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/interests/:id/status
 * Accept or decline an interest request (Owner only)
 */
export const updateInterestStatus = async (req, res, next) => {
  try {
    const { id: interestId } = interestIdParamSchema.parse(req.params);
    const { status } = updateInterestStatusSchema.parse(req.body);
    const userId = req.user.id;

    // Verify interest exists and logged-in user is listing owner
    const checkSql = `
      SELECT i.id, i.listing_id, l.owner_id
      FROM interests i
      JOIN listings l ON i.listing_id = l.id
      WHERE i.id = $1;
    `;
    const checkRes = await query(checkSql, [interestId]);

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Interest request not found' });
    }

    const { listing_id, owner_id } = checkRes.rows[0];

    if (owner_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only respond to requests for your own listings',
      });
    }

    // Update interest status
    const updateSql = `
      UPDATE interests
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const result = await query(updateSql, [status, interestId]);

    // If accepted, also mark the material listing as 'reserved'
    if (status === 'accepted') {
      await query("UPDATE listings SET status = 'reserved', updated_at = NOW() WHERE id = $1", [listing_id]);
    } else if (status === 'declined') {
      const acceptedCount = await query(
        "SELECT COUNT(*)::int AS count FROM interests WHERE listing_id = $1 AND status = 'accepted'",
        [listing_id]
      );
      if (acceptedCount.rows[0].count === 0) {
        await query(
          "UPDATE listings SET status = 'available', updated_at = NOW() WHERE id = $1 AND status = 'reserved'",
          [listing_id]
        );
      }
    }

    res.json({
      success: true,
      message: `Interest request marked as ${status}`,
      interest: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/interests/:id
 * Cancel/withdraw an interest proposal (Requester, Listing Owner, or Admin)
 * Works across pending, accepted, or declined statuses.
 */
export const deleteInterest = async (req, res, next) => {
  try {
    const { id: interestId } = interestIdParamSchema.parse(req.params);
    const userId = req.user.id;

    // Check if interest exists and grab listing & recipient info
    const checkSql = `
      SELECT i.id, i.listing_id, i.recipient_id, i.status, l.owner_id
      FROM interests i
      JOIN listings l ON i.listing_id = l.id
      WHERE i.id = $1;
    `;
    const checkRes = await query(checkSql, [interestId]);

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Interest request not found' });
    }

    const { listing_id, recipient_id, status: interestStatus, owner_id } = checkRes.rows[0];

    // Authorization: User must be recipient (who made the proposal), listing owner (donor), or admin
    if (recipient_id !== userId && owner_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to cancel this proposal request',
      });
    }

    // Delete the interest request
    await query('DELETE FROM interests WHERE id = $1', [interestId]);

    // If the proposal was 'accepted', check if there are any remaining accepted proposals for this listing.
    // If not, revert listing status back to 'available'
    if (interestStatus === 'accepted') {
      const remainingAccepted = await query(
        "SELECT COUNT(*)::int AS count FROM interests WHERE listing_id = $1 AND status = 'accepted'",
        [listing_id]
      );
      if (remainingAccepted.rows[0].count === 0) {
        await query(
          "UPDATE listings SET status = 'available', updated_at = NOW() WHERE id = $1 AND status = 'reserved'",
          [listing_id]
        );
      }
    }

    res.json({
      success: true,
      message: 'Proposal request cancelled successfully',
      interestId,
    });
  } catch (err) {
    next(err);
  }
};
