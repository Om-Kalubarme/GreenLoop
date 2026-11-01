# GreenLoop — Server Backend (Node.js & Express)

The production-grade REST API backend for **GreenLoop — AI-Powered Waste-to-Resource Platform**, built with Node.js (ES Modules), Express.js, PostgreSQL (`pg.Pool`), JWT authentication, Zod validation, and Cloudinary media processing.

---

## 1. Technologies & Architecture

- **Runtime:** Node.js v18+ (Native ES Modules `"type": "module"`)
- **Web Framework:** Express.js 4.x
- **Database:** PostgreSQL 14+ via `pg` connection pool with parameterization (`$1, $2`)
- **Authentication:** Signed JSON Web Tokens (`jsonwebtoken`) with `HS256` + `bcryptjs` password hashing (cost factor 10)
- **Validation:** Zod schemas (`zod`) for request bodies, query strings, and UUID params
- **Media Uploads:** Multer with Cloudinary integration (`cloudinary`) and automated local disk fallback (`uploads/`)
- **Testing:** Jest + Supertest (`28 automated integration tests`)
- **Circuit Breaker:** Axios proxy to Python ML service with 1500ms timeout and automatic 100-point rule-based fallback

---

## 2. Directory Layout

```
server/
├── src/
│   ├── config/
│   │   ├── db.js             # PostgreSQL connection pool with SSL detection
│   │   └── cloudinary.js     # Cloudinary v2 SDK configuration
│   ├── controllers/
│   │   ├── auth.controller.js          # Register, Login, Me, UpdateProfile
│   │   ├── listing.controller.js       # CRUD, filters, pagination, soft archive
│   │   ├── interest.controller.js      # Reuse proposals, state transitions
│   │   └── recommendation.controller.js# Dual-layer recommendation resolver
│   ├── db/
│   │   ├── schema.sql        # PostgreSQL DDL with UUIDs, FKs, constraints, indexes
│   │   ├── migrate.js        # Deterministic schema runner
│   │   └── seed.js           # 5 users, 10 listings, interests, match results
│   ├── middleware/
│   │   ├── auth.middleware.js# JWT Bearer verification & role guards
│   │   ├── errorHandler.js   # Centralized error handler & 404 handler
│   │   └── upload.js         # Multer multipart/form-data handler (5MB limit)
│   ├── routes/
│   │   ├── index.js          # Master router mounted at /api
│   │   ├── auth.routes.js    # /api/auth
│   │   ├── user.routes.js    # /api/users
│   │   ├── listing.routes.js # /api/listings
│   │   ├── upload.routes.js  # /api/uploads
│   │   ├── interest.routes.js# /api/interests
│   │   ├── recommendation.routes.js # /api/recommendations
│   │   └── health.routes.js  # /api/health
│   ├── services/
│   │   ├── cloudinary.service.js    # Cloudinary uploader with local disk fallback
│   │   └── recommendation.service.js# 100-point rule scorer & Python ML proxy
│   ├── validators/
│   │   ├── auth.validator.js     # User registration and login schemas
│   │   ├── listing.validator.js  # Listing creation and filter schemas
│   │   └── interest.validator.js # Interest proposal message and status schemas
│   ├── tests/
│   │   ├── auth.test.js          # 8 tests: Auth, JWT, password complexity
│   │   ├── listings.test.js      # 7 tests: CRUD, ownership, filters
│   │   ├── interests.test.js     # 7 tests: Proposal workflow & status
│   │   └── recommendations.test.js# 6 tests: Scoring logic, ranking, audit trail
│   ├── app.js                # Express app setup, CORS, and middleware
│   └── server.js             # Entrypoint listening on PORT (5001)
├── uploads/                  # Local media directory for offline fallback
├── .env.example              # Environment variable template
├── package.json              # NPM dependencies and scripts
└── README.md                 # Server documentation
```

---

## 3. Environment Variables

Create `.env` inside `server/`:
```bash
# Server Port & Mode
PORT=5001
NODE_ENV=development

# PostgreSQL Connection String
DATABASE_URL=postgresql://localhost:5432/greenloop

# JWT Secret Key (min 32 characters)
JWT_SECRET=super-secret-greenloop-jwt-key-2026-production

# CORS Frontend Whitelist
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary Credentials (falls back to local disk if omitted)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Python ML Matcher Microservice
MATCHER_SERVICE_URL=http://localhost:8000
MATCHER_TIMEOUT_MS=1500
```

---

## 4. Setup, Migration & Seeding Commands

```bash
# 1. Install dependencies
npm install

# 2. Run deterministic database migration
npm run db:migrate

# 3. Populate database with realistic demo data
npm run db:seed

# 4. Start development server with auto-restart
npm run dev

# 5. Run full automated integration test suite (28 passing tests)
npm test
```

---

## 5. Security & Ownership Architecture

- **ACID Transactions:** Material reservations operate within PostgreSQL `BEGIN ... COMMIT` blocks to prevent race conditions during pickup acceptance.
- **SQL Injection Immunization:** 100% of SQL statements utilize parameter placeholders (`$1, $2`).
- **Authorization & Ownership Checks:** Controllers verify `listing.owner_id === req.user.id` before executing updates, deletions, or interest acceptances.
- **Soft Deletions:** Material deletions update status to `archived`, preserving historical audit logs in `match_results` and `interests`.
