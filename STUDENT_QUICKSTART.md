# 🌿 GreenLoop — Student Quickstart & Project Guide

Welcome to **GreenLoop**, an end-to-end AI-powered circular economy platform connecting businesses with industrial surplus/byproducts to local recyclers, artisans, and NGOs to achieve zero waste to landfill.

---

## ⚡ 1. Quick Start (1-Click Run)

### 🪟 On Windows
1. Unzip the project folder (e.g. `GreenLoop/`).
2. Double-click **`start.bat`**.
3. It will automatically:
   - Detect Node.js
   - Install all dependencies for root, server, and client (first run only)
   - Boot both the Node.js API backend (`5001`) and Vite frontend (`5173`)
   - Open your web browser automatically at `http://localhost:5173`!

### 🍎 On macOS / 🐧 Linux
Open a terminal in the `GreenLoop` directory and run:
```bash
./start.sh
```
*(Or `npm run install:all && npm run dev`)*

---

## 🔑 2. Ready-to-Use Demo Accounts

You can log in immediately using these pre-seeded demo accounts (password for all is `Password123!`):

| Role | Email | Password | What You Can Do |
|------|-------|----------|-----------------|
| **Donor / Business** | `rahul@greenloop.org` | `Password123!` | Create surplus waste listings, upload photos, manage claims |
| **Artisan / Upcycler** | `ananya@artisan.org` | `Password123!` | Browse materials, view AI match score, claim timber & cardboard |
| **Recipient / NGO** | `sakshi@ecocrafts.org` | `Password123!` | Request bulk waste, track carbon diversion metrics |

*You can also register a brand new account or click "Continue with Google" for OAuth sign-in.*

---

## 🗄️ 3. Database Configuration

The project is configured to connect to PostgreSQL. Pre-configured `.env` files are included in both `server/` and `client/`.

### Option A: Cloud Supabase (Recommended — Zero local DB installation)
In `server/.env`:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.krjyppdacwtbiyyegfmc.supabase.co:5432/postgres
DB_SSL=true
```

### Option B: Local PostgreSQL
If you have PostgreSQL installed locally on port 5432:
```env
DATABASE_URL=postgresql://localhost:5432/resource_ai
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

### 1-Click Database Setup & Reset
To apply table migrations and seed clean listings:
- **Windows:** Double-click **`setup_database.bat`**
- **Mac/Linux:** Run **`./setup_database.sh`**
*(Or execute `npm run db:migrate` followed by `npm run db:clean`)*

---

## 🧪 4. Running Automated Tests

To verify that everything is running with 100% test coverage:

```bash
# Run 30/30 backend integration tests (Auth, Listings, Interests, Recommendations)
npm test

# Run 4/4 Python recommendation microservice tests
npm run test:matcher

# Test production frontend bundle build
npm run build
```

---

## 🏗️ 5. Project Architecture & Ports

```
GreenLoop/
├── client/                 # React 18 + TailwindCSS + Vite (Port 5173)
│   ├── src/components/     # Navbar, ListingCard, Leaflet Map, Modals
│   ├── src/context/        # AuthContext (JWT + Supabase OAuth sync)
│   ├── src/pages/          # Feed, Details, Create, Edit, Recommendations, Dashboard
│   └── vite.config.js      # Port 5173 strict config
├── server/                 # Node.js + Express REST API (Port 5001)
│   ├── src/controllers/    # Auth, Listings, Interests, Metrics, Recommendations
│   ├── src/db/             # PostgreSQL schema, migrations, and seed scripts
│   ├── src/routes/         # Express API routes (/api/*)
│   └── src/tests/          # Jest integration test suite (30/30 passing)
├── matcher/                # Python FastAPI Recommendation Engine (Port 8000)
│   ├── app.py              # Cosine similarity & category preference matcher
│   └── tests/              # Unittest test cases
├── start.bat               # Windows 1-click runner
├── start.sh                # macOS/Linux 1-click runner
├── setup_database.bat      # Windows 1-click DB migration
├── setup_database.sh      # macOS/Linux 1-click DB migration
└── STUDENT_QUICKSTART.md   # This guide
```

---

## 💡 Troubleshooting & FAQ

- **Port already in use?**
  Make sure you don't have another terminal running the project. If port 5173 or 5001 is occupied, close the old terminal window or restart your PC.
- **PowerShell Execution Policy Error on Windows?**
  If PowerShell blocks scripts, either run in standard Command Prompt (`cmd`) or run once in PowerShell:
  `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
- **Need help?**
  Refer to `PROJECT_DOCUMENTATION.md` for complete API documentation, database schemas, and AI pipeline details.
