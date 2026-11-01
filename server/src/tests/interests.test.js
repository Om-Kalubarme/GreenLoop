import request from 'supertest';
import app from '../app.js';
import { pool } from '../config/db.js';

describe('Phase 5: Browse & Interest Workflow Integration Tests', () => {
  let donorToken = '';
  let recipientToken = '';
  let otherRecipientToken = '';
  let testListingId = '';
  let testInterestId = '';

  const donorUser = {
    name: 'Workflow Donor',
    email: `wf_donor_${Date.now()}@resourceai.org`,
    password: 'Password123!',
    role: 'donor',
    city: 'Bengaluru',
  };

  const recipientUser = {
    name: 'Workflow Recipient',
    email: `wf_rec_${Date.now()}@resourceai.org`,
    password: 'Password123!',
    role: 'recipient',
    city: 'Bengaluru',
  };

  const otherRecipient = {
    name: 'Other Recipient',
    email: `other_rec_${Date.now()}@resourceai.org`,
    password: 'Password123!',
    role: 'recipient',
    city: 'Mumbai',
  };

  beforeAll(async () => {
    // Register users
    const dRes = await request(app).post('/api/auth/register').send(donorUser);
    donorToken = dRes.body.token;

    const rRes = await request(app).post('/api/auth/register').send(recipientUser);
    recipientToken = rRes.body.token;

    const oRes = await request(app).post('/api/auth/register').send(otherRecipient);
    otherRecipientToken = oRes.body.token;

    // Donor creates an available listing
    const lRes = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        title: 'Clean Wooden Craft Crates',
        material_category: 'wood',
        material_type: 'Fruit Crates',
        condition: 'Good',
        quantity_description: '8 crates',
        description: 'Smooth lightweight pine crates suitable for shelf building.',
        city: 'Bengaluru',
      });
    testListingId = lRes.body.listing.id;
  });

  afterAll(async () => {
    try {
      if (testListingId) {
        await pool.query('DELETE FROM listings WHERE id = $1', [testListingId]);
      }
      await pool.query('DELETE FROM users WHERE email IN ($1, $2, $3)', [
        donorUser.email,
        recipientUser.email,
        otherRecipient.email,
      ]);
    } catch (e) {
      // ignore
    }
    await pool.end();
  });

  test('POST /api/listings/:id/interests - Recipient submits interest request', async () => {
    const res = await request(app)
      .post(`/api/listings/${testListingId}/interests`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({
        message: 'Hello, our community workshop would love to collect these crates this Sunday!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.interest.status).toBe('pending');
    testInterestId = res.body.interest.id;
  });

  test('POST /api/listings/:id/interests - Blocks donor from requesting their own listing', async () => {
    const res = await request(app)
      .post(`/api/listings/${testListingId}/interests`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        message: 'Trying to request own item which should fail.',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/own material listing/i);
  });

  test('POST /api/listings/:id/interests - Blocks duplicate interest submissions (409 Conflict)', async () => {
    const res = await request(app)
      .post(`/api/listings/${testListingId}/interests`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({
        message: 'Duplicate request that should fail with 409 conflict.',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/listings/:id/interests - Allows listing owner to view requests with requester profile', async () => {
    const res = await request(app)
      .get(`/api/listings/${testListingId}/interests`)
      .set('Authorization', `Bearer ${donorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.interests.length).toBeGreaterThanOrEqual(1);
    expect(res.body.interests[0].recipient_name).toBe(recipientUser.name);
    expect(res.body.interests[0].recipient_email).toBe(recipientUser.email);
  });

  test('GET /api/listings/:id/interests - Blocks non-owners from inspecting interest proposals (403)', async () => {
    const res = await request(app)
      .get(`/api/listings/${testListingId}/interests`)
      .set('Authorization', `Bearer ${otherRecipientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('PATCH /api/interests/:id/status - Donor accepts request and listing automatically transitions to reserved', async () => {
    const res = await request(app)
      .patch(`/api/interests/${testInterestId}/status`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ status: 'accepted' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.interest.status).toBe('accepted');

    // Verify listing is now 'reserved'
    const listingCheck = await request(app).get(`/api/listings/${testListingId}`);
    expect(listingCheck.body.listing.status).toBe('reserved');
  });

  test('GET /api/interests/my - Recipient verifies proposal is accepted with donor contact', async () => {
    const res = await request(app)
      .get('/api/interests/my')
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const matched = res.body.sent.find((s) => s.id === testInterestId);
    expect(matched).toBeDefined();
    expect(matched.status).toBe('accepted');
    expect(matched.donor_name).toBe(donorUser.name);
  });

  test('PATCH /api/interests/:id/status - Donor declines request', async () => {
    const res = await request(app)
      .patch(`/api/interests/${testInterestId}/status`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ status: 'declined' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.interest.status).toBe('declined');
  });

  test('DELETE /api/interests/:id - Donor removes declined proposal from inquiries list', async () => {
    const res = await request(app)
      .delete(`/api/interests/${testInterestId}`)
      .set('Authorization', `Bearer ${donorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is removed from donor's received inquiries
    const checkRes = await request(app)
      .get('/api/interests/my')
      .set('Authorization', `Bearer ${donorToken}`);

    const found = checkRes.body.received.find((r) => r.id === testInterestId);
    expect(found).toBeUndefined();
  });
});
