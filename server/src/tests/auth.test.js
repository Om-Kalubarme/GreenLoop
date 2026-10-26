import request from 'supertest';
import app from '../app.js';
import { pool } from '../config/db.js';

describe('Phase 3: Authentication & Authorization Integration Tests', () => {
  const testUser = {
    name: 'Jest Test Recipient',
    email: `jest_test_${Date.now()}@resourceai.org`,
    password: 'Password123!',
    role: 'recipient',
    city: 'Bengaluru',
    preferred_categories: ['cardboard', 'wood'],
  };

  let authToken = '';

  afterAll(async () => {
    // Cleanup created test user
    try {
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    } catch (e) {
      // ignore
    }
    await pool.end();
  });

  test('POST /api/auth/register - Successfully registers new user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.role).toBe('recipient');
    expect(res.body.user.password_hash).toBeUndefined(); // Security: password never returned!

    authToken = res.body.token;
  });

  test('POST /api/auth/register - Rejects duplicate email registration with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test('POST /api/auth/register - Rejects invalid email with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        ...testUser,
        email: 'not-an-email',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation failed');
  });

  test('POST /api/auth/login - Successfully authenticates user and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('POST /api/auth/login - Rejects invalid password with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid email or password');
  });

  test('GET /api/auth/me - Returns current user profile with valid JWT Bearer', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.name).toBe(testUser.name);
  });

  test('GET /api/auth/me - Rejects request without token with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('PATCH /api/users/me - Updates user location and material preferences', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        city: 'Mumbai',
        preferred_categories: ['glass', 'textile'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.city).toBe('Mumbai');
    expect(res.body.user.preferred_categories).toEqual(['glass', 'textile']);
  });
});
