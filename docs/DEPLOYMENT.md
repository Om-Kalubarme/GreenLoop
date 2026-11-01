# GreenLoop — Production Deployment & Cloud Architecture Guide

## 1. Deployment Topology & Overview

GreenLoop is designed as a decoupled, multi-tier cloud application:

```
┌─────────────────────────────────┐
│     Client Single-Page App      │  ── Vercel (Global Edge CDN)
│     React 18 + Vite + Tailwind  │     URL: https://greenloop.vercel.app
└────────────────┬────────────────┘
                 │ (HTTPS REST API / JSON)
                 ▼
┌─────────────────────────────────┐
│     Backend Application API     │  ── Render / Railway
│     Node.js + Express.js        │     URL: https://greenloop-api.onrender.com
└───────┬─────────────────┬───────┘
        │                 │ (Internal HTTP / 1500ms circuit breaker)
        │                 ▼
        │        ┌─────────────────────────────────┐
        │        │   Optional Python ML Matcher    │ ── Render / Railway Service
        │        │   FastAPI + scikit-learn        │    URL: https://greenloop-matcher.onrender.com
        │        └─────────────────────────────────┘
        ▼
┌─────────────────────────────────┐
│   Managed PostgreSQL Database   │  ── Neon / Supabase / Render Managed PG
│   Relational Schema + B-Trees   │     Connection: postgresql://...
└─────────────────────────────────┘
```

---

## 2. Production Environment Variables Checklist

### Frontend (`client/.env.production`)
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of deployed Express API | `https://greenloop-api.onrender.com/api` |

### Backend (`server/.env.production`)
| Variable | Required? | Description | Example Value |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | Node runtime environment | `production` |
| `PORT` | Yes | Server listening port | `5001` (or `$PORT` assigned by host) |
| `DATABASE_URL` | Yes | PostgreSQL connection URI | `postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/greenloop?sslmode=require` |
| `JWT_SECRET` | Yes | Cryptographic secret for signing tokens | `min-32-char-high-entropy-random-string` |
| `CLIENT_URL` | Yes | Whitelisted frontend domain for CORS | `https://greenloop.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary account name | `greenloop-prod` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret | `abcdefghijklmnopqrstuv` |
| `MATCHER_SERVICE_URL` | Optional | Python microservice URL | `http://greenloop-matcher:8000` |
| `MATCHER_TIMEOUT_MS` | Optional | Circuit breaker timeout in ms | `1500` |

### Python Matcher (`matcher/.env`)
| Variable | Required? | Description | Example Value |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | Port for Uvicorn server | `8000` |

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Provision Managed PostgreSQL (Neon / Supabase)
1. Create a free PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the pooled connection string (with `?sslmode=require`).
3. Note: Ensure SSL configuration is enabled in `server/src/config/db.js` (`ssl: { rejectUnauthorized: false }`).

### Step 2: Deploy Backend to Render
1. Connect your GitHub repository to [Render](https://render.com).
2. Choose **New Web Service**:
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run db:migrate && npm start`
3. Under **Environment Variables**, add:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `NODE_ENV = production`
4. Deploy the service. Verify deployment by visiting `https://<your-render-subdomain>.onrender.com/api/health`.
5. Run the seed script to populate sample materials:
   ```bash
   # From Render Shell or local terminal with production DATABASE_URL
   DATABASE_URL="<production-db-url>" npm run db:seed
   ```

### Step 3: Deploy Frontend to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://<your-render-subdomain>.onrender.com/api`
4. Deploy. Vercel automatically applies `client/vercel.json` rewrites for React Router SPA routes.

### Step 4: (Optional) Deploy Python Matcher Service
1. On Render, select **New Web Service**:
   - **Root Directory:** `matcher`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port 8000`
2. Update the backend environment variable `MATCHER_SERVICE_URL` to point to the matcher service.
3. *Note:* If this step is omitted, the backend's circuit breaker automatically uses the Tier 1 explainable rule-based engine.

---

## 4. Production Build Verification

Both frontend and backend production builds have been verified:

### Client Production Build
```bash
cd client
npm run build
```
- Output bundle:
  - `dist/index.html` (0.82 kB)
  - `dist/assets/index-*.css` (40.45 kB)
  - `dist/assets/index-*.js` (338.09 kB)
- Verified build time: <1 second.

### Backend Production Verification
```bash
cd server
npm test
```
- 28 automated integration tests passing across authentication, listings, proposals, and recommendation scoring.

---

## 5. Troubleshooting & Common Production Pitfalls

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **CORS Blocked Error** | `CLIENT_URL` does not match the exact Vercel frontend origin | In Render dashboard, set `CLIENT_URL` to exact URL (e.g., `https://greenloop.vercel.app` without trailing slash). |
| **PostgreSQL SSL Error (`self-signed certificate`)** | Cloud DB providers (Neon, Supabase) require TLS encryption | Set `ssl: { rejectUnauthorized: false }` in `server/src/config/db.js`. |
| **Vercel 404 on Refresh** | Client-side routing not redirected to `index.html` | Ensure `client/vercel.json` contains `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`. |
| **Render Cold Start Latency** | Free tier spins down after 15 minutes of inactivity | The system probe on the landing page monitors connection and informs the user while the server wakes up. |
| **Cloudinary Missing Keys** | Cloudinary variables not configured | System automatically falls back to local `/uploads/` directory without crashing. |

---

## 6. Live Deployment Placeholders

When live deployment credentials are provided:
- **Frontend App:** `https://greenloop.vercel.app`
- **Backend API:** `https://greenloop-api.onrender.com`
- **API Health Check:** `https://greenloop-api.onrender.com/api/health`
- **Python Matcher:** `https://greenloop-matcher.onrender.com`
