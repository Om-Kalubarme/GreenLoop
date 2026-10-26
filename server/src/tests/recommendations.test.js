import request from 'supertest';
import app from '../app.js';
import { pool, query } from '../config/db.js';
import { computeRuleBasedScore } from '../services/recommendation.service.js';

describe('Phase 6: Recommendation Engine Integration & Unit Tests', () => {
  let recipientToken = '';
  let recipientUserId = '';
  let donorToken = '';
  let donorUserId = '';

  const testRecipient = {
    name: 'Rec Test User',
    email: `rec_test_${Date.now()}@resourceai.org`,
    password: 'Password123!',
    role: 'recipient',
    city: 'Bengaluru',
    preferred_categories: ['cardboard', 'glass'],
  };

  const testDonor = {
    name: 'Rec Donor User',
    email: `rec_donor_${Date.now()}@resourceai.org`,
    password: 'Password123!',
    role: 'donor',
    city: 'Bengaluru',
  };

  beforeAll(async () => {
    // Register recipient with preferred categories
    const rRes = await request(app).post('/api/auth/register').send(testRecipient);
    recipientToken = rRes.body.token;
    recipientUserId = rRes.body.user.id;

    // Register donor
    const dRes = await request(app).post('/api/auth/register').send(testDonor);
    donorToken = dRes.body.token;
    donorUserId = dRes.body.user.id;

    // Donor creates two listings:
    // 1. Exact category and city match (cardboard in Bengaluru)
    await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        title: 'Corrugated Shipping Boxes High Grade',
        material_category: 'cardboard',
        material_type: 'Boxes',
        condition: 'Good',
        quantity_description: '25 boxes',
        description: 'Clean shipping boxes from warehouse, cardboard is dry and flat.',
        city: 'Bengaluru',
      });

    // 2. Mismatched category and city (metal in Delhi)
    await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        title: 'Scrap Metal Sheets',
        material_category: 'metal',
        material_type: 'Aluminum',
        condition: 'Fair',
        quantity_description: '5 sheets',
        description: 'Aluminum sheets from workshop renovation in industrial area.',
        city: 'Delhi',
      });
  });

  afterAll(async () => {
    // Clean up test listings and users
    if (donorUserId) {
      await query('DELETE FROM listings WHERE owner_id = $1;', [donorUserId]);
      await query('DELETE FROM users WHERE id = $1;', [donorUserId]);
    }
    if (recipientUserId) {
      await query('DELETE FROM match_results WHERE user_id = $1;', [recipientUserId]);
      await query('DELETE FROM users WHERE id = $1;', [recipientUserId]);
    }
  });

  describe('Unit Tests: 100-Point Rule-Based Scorer', () => {
    it('should assign 40 points for category match and 25 for city match', () => {
      const mockListing = {
        title: 'Cardboard Boxes',
        material_category: 'cardboard',
        material_type: 'Boxes',
        description: 'Plain boxes',
        city: 'Bengaluru',
        created_at: new Date().toISOString(),
      };

      const mockProfile = {
        city: 'Bengaluru',
        preferred_categories: ['cardboard'],
      };

      const result = computeRuleBasedScore(mockListing, mockProfile);
      expect(result.score).toBeGreaterThanOrEqual(65); // 40 (category) + 25 (city) + 15 (recent)
      expect(result.breakdown.categoryScore).toBe(40);
      expect(result.breakdown.cityScore).toBe(25);
      expect(result.reason).toContain('cardboard');
      expect(result.reason).toContain('Bengaluru');
    });

    it('should assign 0 points for completely unmatched category and city', () => {
      const mockListing = {
        title: 'Steel Rebar',
        material_category: 'metal',
        material_type: 'Rebar',
        description: 'Industrial rods',
        city: 'Chennai',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days old
      };

      const mockProfile = {
        city: 'Bengaluru',
        preferred_categories: ['textile'],
      };

      const result = computeRuleBasedScore(mockListing, mockProfile);
      expect(result.breakdown.categoryScore).toBe(0);
      expect(result.breakdown.cityScore).toBe(0);
      expect(result.breakdown.recencyScore).toBe(0);
      expect(result.score).toBe(0);
    });
  });

  describe('Endpoint: GET /api/recommendations', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/recommendations');
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/token/i);
    });

    it('should return ranked recommendations for authenticated recipient', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.recommendations)).toBe(true);
      expect(res.body.engine).toBeDefined();

      if (res.body.recommendations.length > 0) {
        const topItem = res.body.recommendations[0];
        expect(topItem).toHaveProperty('id');
        expect(topItem).toHaveProperty('title');
        expect(topItem).toHaveProperty('score');
        expect(topItem).toHaveProperty('reason');
        expect(typeof topItem.score).toBe('number');
        expect(typeof topItem.reason).toBe('string');
      }
    });

    it('should rank cardboard item higher than scrap metal for cardboard-preferring user', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(res.status).toBe(200);
      const recs = res.body.recommendations;

      const cardboardRec = recs.find((r) => r.material_category === 'cardboard');
      const metalRec = recs.find((r) => r.material_category === 'metal');

      if (cardboardRec && metalRec) {
        expect(cardboardRec.score).toBeGreaterThan(metalRec.score);
      }
    });

    it('should record audit results in match_results table', async () => {
      const auditRes = await query(
        'SELECT * FROM match_results WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 1;',
        [recipientUserId]
      );
      expect(auditRes.rows.length).toBeGreaterThan(0);
      expect(auditRes.rows[0].user_id).toBe(recipientUserId);
      expect(parseFloat(auditRes.rows[0].score)).toBeGreaterThanOrEqual(0);
      expect(auditRes.rows[0].reason).toBeDefined();
    });
  });
});
