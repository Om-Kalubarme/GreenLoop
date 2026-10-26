# ReSource AI — Comprehensive Project Plan

## 1. Project Overview & Meta Information

* **Project Title:** ReSource AI — AI-Powered Waste-to-Resource Platform
* **Academic Level:** Final-Year Bachelor of Computer Science (BCS) Capstone Project
* **Nature of Platform:** Full-Stack Circular Economy Web Application with Content-Based Recommendation Architecture
* **Target Audience:** Donors (households, food establishments, artisans, commercial warehouses) and Recipients (students, NGOs, hobbyists, recycling hubs, small businesses)
* **Mentor Guidance Strategy:** Modular, progressive phase-by-phase implementation where every milestone is verified independently with automated checks, unit tests, and documentation artifacts before progression.

---

## 2. Implementation Methodology & Philosophy

1. **Strict Phased Progression:** Development proceeds sequentially across 10 defined phases (Phase 0 to Phase 9). No phase is skipped or marked done without satisfying its acceptance criteria.
2. **Defensive Architecture & Graceful Degradation:** The machine learning subsystem operates as an enhancement rather than a critical point of failure. If the Python ML microservice is unreachable, the system automatically falls back to an explainable rule-based scoring algorithm.
3. **Security by Default:** Environment variables are strictly enforced for all secrets; database credentials, JWT secrets, and third-party API keys are never hardcoded. User passwords are encrypted with bcrypt, and API inputs are validated using schema validators (Zod).
4. **Transparent Explainability:** Every recommendation presented to a recipient includes human-readable reasoning explaining why the item was prioritized.
5. **Beginner-Friendly, Maintainable Codebase:** Clean structure, consistent code style, intuitive naming conventions, and educational inline commentary to support academic evaluation and project viva defence.

---

## 3. Phased Implementation Breakdown

```mermaid
gantt
    title ReSource AI Implementation Roadmap
    dateFormat  YYYY-MM-DD
    section Documentation & Foundation
    Phase 0: Planning & Documentation :active, p0, 2026-10-26, 1d
    Phase 1: Project & Repo Setup       :p1, after p0, 1d
    Phase 2: Database & Backend Core   :p2, after p1, 1d
    section Core Application
    Phase 3: Auth & Identity           :p3, after p2, 1d
    Phase 4: Listings & Image Upload   :p4, after p3, 1d
    Phase 5: Browse, Search & Interest :p5, after p4, 1d
    section Intelligence & Assurance
    Phase 6: Recommendation Engine     :p6, after p5, 1d
    Phase 7: Testing, Polish & A11y    :p7, after p6, 1d
    section Deployment & Handover
    Phase 8: Deployment & Cloud Config :p8, after p7, 1d
    Phase 9: Final Docs & Demo Viva    :p9, after p8, 1d
```

### Phase 0: Planning and Documentation
* **Goal:** Establish a rigorous architectural, academic, and technical foundation before generating application code.
* **Key Deliverables:**
  * Root `README.md` and `LICENSE`
  * Comprehensive Project Plan (`PROJECT_PLAN.md`)
  * Project Design Report (`PDR.md`)
  * Technical Design Report (`TDR.md`)
  * System Architecture Specification (`ARCHITECTURE.md`) with Mermaid diagrams
* **Acceptance Criteria:**
  * Clear definition of MVP scope versus non-goals.
  * Complete ER model, API contract definitions, and recommendation mathematical formulas documented.

---

### Phase 1: Repository and Project Setup
* **Goal:** Initialize git repository, configure frontend and backend skeletons, establish environment templates, and verify client-to-server connectivity.
* **Key Deliverables:**
  * Git repo initialized with root `.gitignore`
  * `client/`: React.js + Vite application configured with Tailwind CSS
  * `server/`: Node.js + Express REST API structure
  * Health check endpoint: `GET /api/health`
  * Frontend landing hero page with live backend health status indicator
* **Acceptance Criteria:**
  * Frontend starts cleanly via `npm run dev`.
  * Backend returns `{"status":"ok","uptime":...,"timestamp":...}`.
  * Browser confirms successful HTTP handshake between client and server.

---

### Phase 2: Database and Backend Foundation
* **Goal:** Establish the PostgreSQL relational database schema, database connection pool, migration scripts, error handling middleware, and seed data.
* **Key Deliverables:**
  * PostgreSQL DDL schema with 4 primary tables: `users`, `listings`, `interests`, `match_results`
  * Migration runner and seed runner scripts (`db:migrate`, `db:seed`)
  * Generic database connection pool module (`server/src/config/db.js`)
  * Centralized error handling and async wrapper middleware
  * Zod validation pipeline
  * Initial read endpoint: `GET /api/listings`
* **Acceptance Criteria:**
  * Database migrations create all tables, primary keys, foreign keys, and indexes without errors.
  * Seed script populates realistic demo items across multiple categories and cities.
  * `GET /api/listings` returns active listings from PostgreSQL.

---

### Phase 3: Authentication and Authorization
* **Goal:** Implement secure user registration, login, JWT token issuance, password hashing, and role-based access control.
* **Key Deliverables:**
  * Auth endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PATCH /api/users/me`
  * Password security using `bcrypt` (10 salt rounds)
  * JWT verification middleware (`verifyToken`)
  * Frontend `AuthContext` with persistent session state (localStorage)
  * Login and Registration pages with client-side form validation
  * Protected route guards for donor dashboard and profile
* **Acceptance Criteria:**
  * Duplicate email registrations are rejected with a 409 Conflict error.
  * Passwords never exist in plaintext in database or logs.
  * Authenticated users receive valid JWT tokens and can access protected endpoints.
  * Unauthenticated requests to protected endpoints return 401 Unauthorized.

---

### Phase 4: Listings and Cloudinary Uploads
* **Goal:** Enable donors to create, view, update, and archive material listings with image uploads.
* **Key Deliverables:**
  * Endpoints: `POST /api/listings`, `GET /api/listings/:id`, `PATCH /api/listings/:id`, `DELETE /api/listings/:id`
  * Cloudinary upload service (`POST /api/uploads/image`) with local fallback storage
  * Donor listing creation form with category picker, condition selector, and image dropzone
  * Responsive listing card component and detailed listing view page
  * Donor management dashboard displaying active and archived listings
* **Acceptance Criteria:**
  * Valid listing requests are stored in PostgreSQL associated with the donor's user ID.
  * Non-owners cannot update or delete listings (enforced 403 Forbidden).
  * Uploaded images generate valid URLs rendered on listing cards.

---

### Phase 5: Browse and Interest Workflow
* **Goal:** Deliver recipient discovery tools (search, filtering) and complete the communication loop where recipients express interest in items.
* **Key Deliverables:**
  * Browse marketplace page with live search and multi-facet filtering (Category, City, Condition, Keyword)
  * Endpoints: `POST /api/listings/:id/interests`, `GET /api/listings/:id/interests`, `GET /api/users/me/interests`
  * Interest submission modal / form on listing detail page
  * Donor interest management panel (view requester details, message, accept/decline action)
* **Acceptance Criteria:**
  * Recipient can filter materials by city and category in real time.
  * Recipient can submit an interest request with an explanatory message.
  * Donors can inspect received requests and update status (`pending`, `accepted`, `declined`).

---

### Phase 6: Recommendation System (Dual-Layer)
* **Goal:** Deliver an intelligent, explainable recommendation system with a baseline heuristic scorer and an enhanced Python TF-IDF cosine similarity engine.
* **Key Deliverables:**
  * Recipient category and location preference configuration (`PATCH /api/users/me`)
  * Rule-based scoring engine in Node.js (Category: 40pts, City: 25pts, Keywords: 20pts, Recency: 15pts)
  * Python recommendation service (`matcher/app.py`, `matcher/rank.py`) using `scikit-learn` `TfidfVectorizer` and `cosine_similarity`
  * Recommendation endpoint: `GET /api/recommendations` with fallback logic
  * Frontend recommendations view highlighting match score and human-readable explanation
* **Acceptance Criteria:**
  * Listings are ranked accurately according to recipient preferences.
  * Each recommendation presents a clear explanation string (e.g., *"Recommended because it matches your preferred category 'cardboard' and is located in your city 'Bengaluru'"*).
  * If the Python service is offline, the backend seamlessly falls back to the rule-based engine without throwing errors.

---

### Phase 7: Testing, Security, Accessibility, and Polish
* **Goal:** Harden the application through comprehensive automated API tests, manual test matrices, accessibility enhancements, responsive design reviews, and rich seed data.
* **Key Deliverables:**
  * Automated Jest / Supertest integration test suite covering Auth, Listings, Interests, and Recommendations
  * Test Plan document (`docs/TEST_PLAN.md`) and manual verification matrix
  * Accessibility audit (ARIA tags, alt texts, keyboard focus rings, semantic markup)
  * Refined loading spinners, empty states, and error alerts
  * Realistic seed dataset with 12 diverse listings across 6 categories and 4 major cities
* **Acceptance Criteria:**
  * All automated tests pass with 100% green status.
  * Form inputs are validated defensively against SQL injection and XSS payloads.
  * UI is fully responsive across mobile (375px), tablet (768px), and desktop (1280px).

---

### Phase 8: Deployment Preparation
* **Goal:** Prepare production builds, configure cloud environments (Vercel, Render/Railway, Neon PostgreSQL), setup CORS, and document troubleshooting protocols.
* **Key Deliverables:**
  * Production build scripts (`npm run build`) verified for both client and server
  * Production environment variable checklists (`client/.env.example`, `server/.env.example`)
  * Deployment architecture blueprint (`docs/DEPLOYMENT.md`)
  * CORS whitelist configuration for production domains
* **Acceptance Criteria:**
  * Client bundle compiles cleanly with zero Vite warnings.
  * Server starts in production mode (`NODE_ENV=production`) using environment variables.

---

### Phase 9: Final Documentation and Handover
* **Goal:** Finalize all academic reports, technical documentation, API collections, and presentation materials.
* **Key Deliverables:**
  * Completed `docs/PDR.md`, `docs/TDR.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DATABASE.md`, `docs/ML_RECOMMENDATION.md`, `docs/USER_MANUAL.md`
  * Postman Collection file (`postman/ReSource-AI.postman_collection.json`)
  * Academic viva and demo script (`docs/DEMO_SCRIPT.md`)
  * Component-level READMEs (`client/README.md`, `server/README.md`, `matcher/README.md`)
* **Acceptance Criteria:**
  * All documentation is synchronized with the final codebase.
  * Postman collection executes cleanly across all endpoints.
  * Complete project is ready for evaluation and viva defence.

---

## 4. Documentation Checklist

| Document | Location | Status | Target Phase |
| :--- | :--- | :---: | :---: |
| Project Plan | `docs/PROJECT_PLAN.md` | Complete | Phase 0 |
| Project Design Report | `docs/PDR.md` | Complete | Phase 0 |
| Technical Design Report | `docs/TDR.md` | Complete | Phase 0 |
| System Architecture | `docs/ARCHITECTURE.md` | Complete | Phase 0 |
| REST API Contract | `docs/API.md` | Drafted | Phase 2 / Phase 9 |
| Database Schema Reference | `docs/DATABASE.md` | Drafted | Phase 2 / Phase 9 |
| ML & Recommendation Specs | `docs/ML_RECOMMENDATION.md` | Drafted | Phase 6 / Phase 9 |
| Quality & Test Plan | `docs/TEST_PLAN.md` | Drafted | Phase 7 / Phase 9 |
| Cloud Deployment Guide | `docs/DEPLOYMENT.md` | Drafted | Phase 8 / Phase 9 |
| User & Admin Manual | `docs/USER_MANUAL.md` | Drafted | Phase 9 |
| Postman Collection | `postman/ReSource-AI.postman_collection.json` | Drafted | Phase 9 |
