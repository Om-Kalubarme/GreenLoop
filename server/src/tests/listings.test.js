import request from 'supertest';
import app from '../app.js';
import { pool } from '../config/db.js';

describe('Phase 4: Material Listings & Authorization Integration Tests', () => {
  let donorToken = '';
  let recipientToken = '';
  let createdListingId = '';

  const donorUser = {
    name: 'Jest Donor',
    email: `jest_donor_${Date.now()}@resourceai.org`,
    password: 'Password123!',
    role: 'donor',
    city: 'Bengaluru',
  };

  const recipientUser = {
    name: 'Jest Recipient',
    email: `jest_rec_${Date.now()}@resourceai.org`,
    password: 'Password123!',
    role: 'recipient',
    city: 'Bengaluru',
  };

  beforeAll(async () => {
    // Register test donor
    const dRes = await request(app).post('/api/auth/register').send(donorUser);
    donorToken = dRes.body.token;

    // Register test recipient
    const rRes = await request(app).post('/api/auth/register').send(recipientUser);
    recipientToken = rRes.body.token;
  });

  afterAll(async () => {
    try {
      if (createdListingId) {
        await pool.query('DELETE FROM listings WHERE id = $1', [createdListingId]);
      }
      await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [donorUser.email, recipientUser.email]);
    } catch (e) {
      // ignore
    }
    await pool.end();
  });

  test('POST /api/listings - Allows authenticated donor to create a material listing', async () => {
    const payload = {
      title: 'Dense Foam Cushioning Blocks',
      material_category: 'plastic',
      material_type: 'EPE Foam Blocks',
      condition: 'Like New',
      quantity_description: '20 blocks',
      description: 'Clean shock-absorbing foam blocks from server packaging. Ideal for studio soundproofing or safe transit packaging.',
      city: 'Bengaluru',
      image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800',
    };

    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${donorToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.listing.title).toBe(payload.title);
    expect(res.body.listing.status).toBe('available');
    createdListingId = res.body.listing.id;
  });

  test('POST /api/listings - Blocks recipient from creating listings (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({
        title: 'Unauthorized Listing',
        material_category: 'wood',
        material_type: 'Planks',
        condition: 'Good',
        quantity_description: '1',
        description: 'Should be rejected',
        city: 'Bengaluru',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/listings/my/listings - Returns donor-specific listings', async () => {
    const res = await request(app)
      .get('/api/listings/my/listings')
      .set('Authorization', `Bearer ${donorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.listings.some((l) => l.id === createdListingId)).toBe(true);
  });

  test('PATCH /api/listings/:id - Allows owner to update listing details and status', async () => {
    const res = await request(app)
      .patch(`/api/listings/${createdListingId}`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        quantity_description: '30 blocks',
        status: 'reserved',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.listing.quantity_description).toBe('30 blocks');
    expect(res.body.listing.status).toBe('reserved');
  });

  test('PATCH /api/listings/:id - Blocks non-owner from updating listing (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/listings/${createdListingId}`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({
        title: 'Malicious Update',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('DELETE /api/listings/:id - Blocks non-owner from archiving listing (403 Forbidden)', async () => {
    const res = await request(app)
      .delete(`/api/listings/${createdListingId}`)
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('DELETE /api/listings/:id - Allows owner to archive listing', async () => {
    const res = await request(app)
      .delete(`/api/listings/${createdListingId}`)
      .set('Authorization', `Bearer ${donorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify status is now 'archived' in DB
    const checkRes = await request(app).get(`/api/listings/${createdListingId}`);
    expect(checkRes.body.listing.status).toBe('archived');
  });
});
