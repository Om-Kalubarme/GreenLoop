# ReSource AI — Server Backend (Node.js & Express)

The REST API backend for ReSource AI provides user authentication, listings management, interest request tracking, image uploads, and an explainable dual-layer recommendation engine.

## Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0.0 or higher
- **npm**: v9.0.0 or higher

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your local PostgreSQL credentials
   ```

3. **Run Migrations & Seed Data:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The server will start listening at `http://localhost:5001`.

## API Endpoints Summary

- `GET /api/health` — Public health check & database latency probe
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — User authentication & JWT issuance
- `GET /api/auth/me` — Authenticated user profile
- `PATCH /api/users/me` — Update user preferences
- `GET /api/listings` — Browse & search available listings
- `POST /api/listings` — Create material listing (Donor)
- `GET /api/listings/:id` — Listing details
- `PATCH /api/listings/:id` — Update listing (Owner)
- `DELETE /api/listings/:id` — Archive listing (Owner)
- `POST /api/uploads/image` — Upload photo (Cloudinary / Local)
- `POST /api/listings/:id/interests` — Send interest request (Recipient)
- `GET /api/listings/:id/interests` — View requests for listing (Donor)
- `GET /api/recommendations` — Transparent explainable recommendations
