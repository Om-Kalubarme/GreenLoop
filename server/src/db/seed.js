import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

async function seedDatabase() {
  console.log('\n--- Seeding PostgreSQL Database with Realistic Demo Data ---');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Clear existing records cleanly
    console.log('Clearing existing records...');
    await client.query('TRUNCATE match_results, interests, listings, users CASCADE;');

    // 2. Hash common password
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const hashedAdminPassword = await bcrypt.hash('AdminPassword123!', 10);

    // 3. Seed Users
    console.log('Inserting seed users...');
    const userInsertQuery = `
      INSERT INTO users (id, name, email, password_hash, role, city, preferred_categories)
      VALUES 
        ('11111111-1111-1111-1111-111111111111', 'Rahul Sharma (Eco Logistics)', 'donor1@resourceai.org', $1, 'donor', 'Bengaluru', ARRAY['cardboard', 'wood']),
        ('22222222-2222-2222-2222-222222222222', 'Priya Patel (Artisan Studio)', 'donor2@resourceai.org', $1, 'donor', 'Mumbai', ARRAY['textile', 'glass']),
        ('33333333-3333-3333-3333-333333333333', 'Ananya Iyer (Design Student)', 'recipient1@resourceai.org', $1, 'recipient', 'Bengaluru', ARRAY['cardboard', 'wood', 'textile']),
        ('44444444-4444-4444-4444-444444444444', 'Arjun Verma (EcoArts NGO)', 'recipient2@resourceai.org', $1, 'recipient', 'Mumbai', ARRAY['glass', 'plastic', 'metal']),
        ('55555555-5555-5555-5555-555555555555', 'Platform Administrator', 'admin@resourceai.org', $2, 'admin', 'Bengaluru', ARRAY['cardboard', 'plastic', 'glass', 'wood', 'textile', 'metal', 'other'])
      RETURNING id, name, email, role, city;
    `;
    const userRes = await client.query(userInsertQuery, [hashedPassword, hashedAdminPassword]);
    console.log(`Inserted ${userRes.rowCount} users.`);

    // 4. Seed 10 Realistic Listings
    console.log('Inserting seed listings across 6 categories...');
    const listings = [
      {
        id: 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        owner_id: '11111111-1111-1111-1111-111111111111',
        title: 'Clean Heavy-Duty Corrugated Shipping Boxes',
        material_category: 'cardboard',
        material_type: 'Corrugated Double-Wall Boxes',
        condition: 'Good',
        quantity_description: '45 large boxes',
        description: 'Clean, flattened brown shipping boxes from electronic equipment delivery. Tape removed, no moisture damage. Perfect for warehouse storage, student installations, or moving.',
        city: 'Bengaluru',
        image_url: '/thumb-cardboard.jpg',
        status: 'available',
        days_ago: 1
      },
      {
        id: 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        owner_id: '11111111-1111-1111-1111-111111111111',
        title: 'Solid Pine Pallet Wood Planks & Blocks',
        material_category: 'wood',
        material_type: 'Untreated Pine Pallets',
        condition: 'Good',
        quantity_description: '18 dismantled pallet planks',
        description: 'Heat-treated (HT), chemical-free pine pallet planks. Nails removed. Ideal for carpentry students, planters, and rustic shelving.',
        city: 'Bengaluru',
        image_url: '/thumb-wood.jpg',
        status: 'available',
        days_ago: 2
      },
      {
        id: 'a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        owner_id: '22222222-2222-2222-2222-222222222222',
        title: 'Clear Amber & Flint Glass Jars with Lids',
        material_category: 'glass',
        material_type: 'Preserve & Jam Jars',
        condition: 'Like New',
        quantity_description: '60 jars (300ml & 500ml)',
        description: 'Sanitized glass jars from organic fruit canning. Metal twist-off lids included. Great for candle pouring, spice storage, and craft centers.',
        city: 'Mumbai',
        image_url: '/thumb-glass.jpg',
        status: 'available',
        days_ago: 2
      },
      {
        id: 'a4444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        owner_id: '22222222-2222-2222-2222-222222222222',
        title: 'Assorted Organic Cotton & Denim Fabric Scraps',
        material_category: 'textile',
        material_type: 'Fabric Remnants',
        condition: 'Brand New',
        quantity_description: '15 kg bundled rolls',
        description: 'Surplus offcuts from an eco-friendly apparel line. High grade cotton, linen, and indigo denim. Excellent for patchwork, quilting, and tote bag fabrication.',
        city: 'Mumbai',
        image_url: '/thumb-textile.jpg',
        status: 'available',
        days_ago: 3
      },
      {
        id: 'a5555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        owner_id: '11111111-1111-1111-1111-111111111111',
        title: 'Food-Grade 20L HDPE Buckets with Airtight Handles',
        material_category: 'plastic',
        material_type: 'HDPE Plastic Buckets',
        condition: 'Like New',
        quantity_description: '12 containers',
        description: 'Food-safe plastic pails from bakery ingredients (icing and syrup). Rinsed thoroughly with hot water. Sturdy handles and snap-on lids.',
        city: 'Bengaluru',
        image_url: '/thumb-plastic.jpg',
        status: 'available',
        days_ago: 4
      },
      {
        id: 'a6666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        owner_id: '22222222-2222-2222-2222-222222222222',
        title: 'Aluminum Extrusions & Sheet Offcuts',
        material_category: 'metal',
        material_type: 'Aluminum Trimmings',
        condition: 'Good',
        quantity_description: '8 kg assorted profiles',
        description: 'Clean architectural framing offcuts. Non-magnetic, corrosion-free alloy. Suitable for robotics clubs, mechanical prototyping, or foundry casting.',
        city: 'Mumbai',
        image_url: '/thumb-metal.jpg',
        status: 'available',
        days_ago: 5
      },
      {
        id: 'a7777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        owner_id: '11111111-1111-1111-1111-111111111111',
        title: 'Dense Kraft Paper Void-Fill Rolls',
        material_category: 'cardboard',
        material_type: 'Kraft Packaging Rolls',
        condition: 'Like New',
        quantity_description: '4 large continuous rolls',
        description: 'Unprinted clean brown packaging paper rolls. Heavyweight biodegradable paper suitable for art sketching, parcel padding, or pattern drafting.',
        city: 'Bengaluru',
        image_url: '/thumb-cardboard.jpg',
        status: 'available',
        days_ago: 6
      },
      {
        id: 'a8888888-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        owner_id: '22222222-2222-2222-2222-222222222222',
        title: 'Hardwood Teak & Oak Flooring Cutoffs',
        material_category: 'wood',
        material_type: 'Timber Offcuts',
        condition: 'Good',
        quantity_description: '25 sq ft offcuts',
        description: 'Short planks from a boutique renovation. Tongue and groove edges intact, unfinished natural wood grain. Perfect for woodturners and mosaic wood art.',
        city: 'Pune',
        image_url: '/thumb-wood.jpg',
        status: 'available',
        days_ago: 7
      },
      {
        id: 'a9999999-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        owner_id: '11111111-1111-1111-1111-111111111111',
        title: 'Sturdy Plastic Egg Crates & Divider Trays',
        material_category: 'plastic',
        material_type: 'Storage Crates',
        condition: 'Fair',
        quantity_description: '20 nesting crates',
        description: 'Heavy duty stackable plastic trays. Clean and durable. Great for urban seed starting, nursery seedlings, or small hardware sorting.',
        city: 'Delhi',
        image_url: '/thumb-plastic.jpg',
        status: 'reserved',
        days_ago: 9
      },
      {
        id: 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        owner_id: '22222222-2222-2222-2222-222222222222',
        title: 'Colored Wine & Olive Oil Glass Bottles',
        material_category: 'glass',
        material_type: 'Green & Amber Glass',
        condition: 'Good',
        quantity_description: '35 bottles',
        description: 'Labels soaked off and cleaned. Mix of deep green and olive tones. Excellent for stained glass works, upcycled bottle cutting, and decorative lighting.',
        city: 'Pune',
        image_url: '/thumb-glass.jpg',
        status: 'available',
        days_ago: 10
      }
    ];

    for (const item of listings) {
      await client.query(`
        INSERT INTO listings (
          id, owner_id, title, material_category, material_type, 
          condition, quantity_description, description, city, 
          image_url, status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          NOW() - INTERVAL '${item.days_ago} days',
          NOW() - INTERVAL '${item.days_ago} days'
        );
      `, [
        item.id, item.owner_id, item.title, item.material_category,
        item.material_type, item.condition, item.quantity_description,
        item.description, item.city, item.image_url, item.status
      ]);
    }
    console.log(`Inserted ${listings.length} listings.`);

    // 5. Seed Sample Interest Requests
    console.log('Inserting seed interest requests...');
    const interestInsertQuery = `
      INSERT INTO interests (id, listing_id, recipient_id, message, status)
      VALUES 
        ('c1111111-cccc-cccc-cccc-cccccccccccc', 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Hi Rahul, we are building a model cardboard pavillion for our architecture review. We can collect these on Saturday afternoon.', 'pending'),
        ('c2222222-cccc-cccc-cccc-cccccccccccc', 'a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Hello Priya, our community art center would love these glass jars for our youth candle-making workshop!', 'accepted')
      RETURNING id, status;
    `;
    const interestRes = await client.query(interestInsertQuery);
    console.log(`Inserted ${interestRes.rowCount} sample interest records.`);

    // 6. Seed Sample Match Results
    console.log('Inserting sample match result cache...');
    await client.query(`
      INSERT INTO match_results (id, listing_id, user_id, score, reason)
      VALUES 
        ('d1111111-dddd-dddd-dddd-dddddddddddd', 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 95.0, 'Recommended because it matches your preferred category (cardboard), is available in your city (Bengaluru), and was posted recently.'),
        ('d2222222-dddd-dddd-dddd-dddddddddddd', 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 90.0, 'Recommended because it matches your preferred category (wood) and is available locally in Bengaluru.')
    `);

    await client.query('COMMIT');
    console.log('✅ Database seeding complete with rich demo data!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
