import axios from 'axios';
import { query } from '../config/db.js';

const MATCHER_SERVICE_URL = process.env.MATCHER_SERVICE_URL || 'http://localhost:8000';
const MATCHER_TIMEOUT_MS = parseInt(process.env.MATCHER_TIMEOUT_MS || '1500', 10);

/**
 * Baseline Rule-Based Recommendation Scorer (100-Point Weighted System)
 * 
 * Weights:
 * - 40 points: Category matches recipient preferred categories
 * - 25 points: City matches recipient city
 * - 20 points: Relevant keywords appear in listing text
 * - 15 points: Listing is recent (<= 3 days: 15, <= 7 days: 10, <= 14 days: 5)
 */
export const computeRuleBasedScore = (listing, recipientProfile) => {
  let score = 0;
  const reasons = [];

  const preferredCategories = (recipientProfile.preferred_categories || []).map((c) =>
    c.toLowerCase().trim()
  );
  const userCity = (recipientProfile.city || '').toLowerCase().trim();
  const listingCategory = (listing.material_category || '').toLowerCase().trim();
  const listingCity = (listing.city || '').toLowerCase().trim();

  // 1. Category Match (40 pts)
  const categoryMatched = preferredCategories.includes(listingCategory);
  if (categoryMatched) {
    score += 40;
    reasons.push(`matches your preferred category, ${listing.material_category}`);
  }

  // 2. City Match (25 pts)
  const cityMatched = Boolean(userCity && listingCity && userCity === listingCity);
  if (cityMatched) {
    score += 25;
    reasons.push(`is available locally in ${listing.city}`);
  }

  // 3. Keyword Match (20 pts)
  // Check if recipient keywords or preferred categories appear in title/description/type
  const searchableText = `${listing.title} ${listing.description} ${listing.material_type}`.toLowerCase();
  let keywordMatched = false;

  for (const cat of preferredCategories) {
    if (searchableText.includes(cat)) {
      keywordMatched = true;
      break;
    }
  }

  if (keywordMatched) {
    score += 20;
    reasons.push('contains relevant keywords matching your interests');
  }

  // 4. Recency Score (15 pts)
  const createdDate = new Date(listing.created_at);
  const now = new Date();
  const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    score += 15;
    reasons.push('was posted recently (within 3 days)');
  } else if (diffDays <= 7) {
    score += 10;
    reasons.push('was posted this week');
  } else if (diffDays <= 14) {
    score += 5;
  }

  // Cap score to 100 max
  score = Math.min(100, Math.max(0, score));

  // Build human-readable explainable reason
  let reasonText = `Recommended because it ${reasons.join(', and ')}.`;
  if (reasons.length === 0) {
    reasonText = `Recommended as an active community surplus item in ${listing.city}.`;
  }

  return {
    score,
    reason: reasonText,
    breakdown: {
      categoryScore: categoryMatched ? 40 : 0,
      cityScore: cityMatched ? 25 : 0,
      keywordScore: keywordMatched ? 20 : 0,
      recencyScore: diffDays <= 3 ? 15 : diffDays <= 7 ? 10 : diffDays <= 14 ? 5 : 0,
    },
  };
};

/**
 * Generate recommendations for recipient
 * Tries Python scikit-learn matcher first; falls back gracefully to rule-based engine
 */
export const getRecommendationsForUser = async (user, topN = 10) => {
  // 1. Fetch available listings from PostgreSQL (excluding items posted by the user themselves)
  const listingsRes = await query(
    `SELECT 
       l.id, l.owner_id, l.title, l.material_category, l.material_type, 
       l.condition, l.quantity_description, l.description, l.city, 
       l.image_url, l.status, l.created_at,
       u.name AS donor_name, u.city AS donor_city
     FROM listings l
     JOIN users u ON l.owner_id = u.id
     WHERE l.status = 'available' AND l.owner_id != $1
     ORDER BY l.created_at DESC;`,
    [user.id]
  );

  const candidateListings = listingsRes.rows;
  if (candidateListings.length === 0) {
    return {
      success: true,
      engine: 'none',
      recommendations: [],
    };
  }

  // 2. Try Python TF-IDF Cosine Similarity microservice with 1500ms timeout
  let rankedListings = null;
  let activeEngine = 'rule-based-fallback';

  try {
    const payload = {
      listings: candidateListings,
      recipient_profile: {
        city: user.city,
        preferred_categories: user.preferred_categories || [],
        keywords: (user.preferred_categories || []).join(' '),
      },
      top_n: topN,
    };

    const pythonRes = await axios.post(`${MATCHER_SERVICE_URL}/rank`, payload, {
      timeout: MATCHER_TIMEOUT_MS,
    });

    if (pythonRes.status === 200 && pythonRes.data?.recommendations) {
      rankedListings = pythonRes.data.recommendations;
      activeEngine = 'scikit-learn (TF-IDF + Cosine Similarity)';
    }
  } catch (err) {
    // Graceful fallback to rule-based scoring without throwing error
    activeEngine = 'Explainable Rule-Based Baseline (Fallback)';
  }

  // 3. If Python service was unavailable or timed out, run rule-based scorer
  if (!rankedListings) {
    rankedListings = candidateListings.map((listing) => {
      const { score, reason } = computeRuleBasedScore(listing, user);
      return {
        ...listing,
        score,
        reason,
      };
    });

    // Sort descending by score
    rankedListings.sort((a, b) => b.score - a.score);
    rankedListings = rankedListings.slice(0, topN);
  }

  // 4. Record top recommendations into match_results table for auditability
  try {
    for (const item of rankedListings.slice(0, 3)) {
      await query(
        `INSERT INTO match_results (listing_id, user_id, score, reason)
         VALUES ($1, $2, $3, $4);`,
        [item.id, user.id, item.score, item.reason]
      );
    }
  } catch (dbErr) {
    // Non-blocking log if match_results insert fails
    console.warn('[Recommendation Service] match_results audit logging error:', dbErr.message);
  }

  return {
    success: true,
    engine: activeEngine,
    count: rankedListings.length,
    recommendations: rankedListings,
  };
};

export default {
  computeRuleBasedScore,
  getRecommendationsForUser,
};
