import { pool } from '../config/db.js';

async function cleanDemoData() {
  console.log('\n--- Cleaning Demo Data from GreenLoop Database ---');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Delete all demo users (@resourceai.org) which cascades to listings and interests
    const delUsers = await client.query("DELETE FROM users WHERE email LIKE '%@resourceai.org'");
    console.log(`Deleted ${delUsers.rowCount} demo user accounts and all associated listings/proposals.`);

    // 2. Clear any lingering match results / recommendations cache
    const delMatches = await client.query('DELETE FROM match_results');
    console.log(`Cleared ${delMatches.rowCount} cached match results.`);

    await client.query('COMMIT');
    console.log('✅ Demo data cleanup complete! Database is clean and ready for real users.\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to clean demo data:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanDemoData();
