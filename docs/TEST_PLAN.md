# GreenLoop — Comprehensive Test Plan & Quality Assurance Matrix

## 1. Quality Assurance Strategy

The GreenLoop verification strategy combines multi-layered automated integration testing, unit testing, schema boundary checks, accessibility audits (WCAG 2.1 AA), and end-to-end user journey validation.

```
                      ┌────────────────────────────┐
                      │    Manual Test Matrix      │
                      │  (End-to-End User Journeys)│
                      └─────────────┬──────────────┘
                                    │
                      ┌─────────────▼──────────────┐
                      │ Integration Test Suites    │
                      │  (Supertest + Jest: 28)    │
                      └─────────────┬──────────────┘
                                    │
                      ┌─────────────▼──────────────┐
                      │    Unit & Schema Tests     │
                      │ (Zod Validators, Scoring)  │
                      └────────────────────────────┘
```

---

## 2. Automated Test Suite Summary

Total Automated Backend Tests: **28 passing tests** executed in Jest with Supertest against PostgreSQL:

| Test Suite | Coverage Area | Key Assertions Verified | Status |
| :--- | :--- | :--- | :--- |
| `src/tests/auth.test.js` | User Authentication & JWT | • Register new donor/recipient<br>• Prevent duplicate email (409)<br>• Validate bcrypt password hashing<br>• Issue signed JWT tokens<br>• Authenticate `GET /api/auth/me`<br>• Update profile preferences (`PATCH /api/users/me`)<br>• Enforce password complexity | **PASS (8/8)** |
| `src/tests/listings.test.js` | Listings CRUD & Media | • Create listing with owner binding<br>• Validate Zod payload schemas (400 on missing title)<br>• Read paginated listings with search & filters<br>• Retrieve single listing by UUID (404 on absent)<br>• Enforce owner-only edit rights (403 on non-owner)<br>• Soft archive listing (status: `archived`) | **PASS (7/7)** |
| `src/tests/interests.test.js` | Reuse Proposals & State Transitions | • Recipient submits interest request<br>• Block donor from requesting own listing (400)<br>• Prevent duplicate interest submissions (400)<br>• Retrieve donor interest inbox<br>• Donor accepts proposal $\rightarrow$ transitions listing to `reserved`<br>• Enforce authorization boundaries on status updates | **PASS (7/7)** |
| `src/tests/recommendations.test.js` | Algorithmic Matcher & Circuit Breaker | • Unit tests for 100-point scoring formula (40pt cat, 25pt city, 20pt kw, 15pt recency)<br>• Zero-score boundary check for mismatched items<br>• Reject unauthenticated requests (401)<br>• Ranked recommendations for authenticated user<br>• Audit trail logging to `match_results` table | **PASS (6/6)** |

---

## 3. Manual Test Matrix & Edge Case Verification

### 3.1 Authentication & Profile Management

| Test ID | Scenario | Input / Action | Expected Result | Verified |
| :--- | :--- | :--- | :--- | :---: |
| `TC-AUTH-01` | Valid Registration | Name: "Eco Maker", Email: `eco@test.org`, Pass: `Secret123!` | Account created, JWT stored in `localStorage`, redirected to Dashboard | ✅ |
| `TC-AUTH-02` | Duplicate Email | Register with existing email `anita.sharma@bengaluru-crafts.org` | HTTP 409 Conflict: "Email already registered" displayed cleanly | ✅ |
| `TC-AUTH-03` | Weak Password | Password: `short` | HTTP 400 Bad Request: "Password must be at least 8 characters" | ✅ |
| `TC-AUTH-04` | Preference Update | Set Preferred Categories to `['cardboard', 'wood']`, City: `Bengaluru` | Updated in PostgreSQL; immediately reflected in AI Recommendations | ✅ |

### 3.2 Listing Creation & Ownership Security

| Test ID | Scenario | Input / Action | Expected Result | Verified |
| :--- | :--- | :--- | :--- | :---: |
| `TC-LIST-01` | Create Listing (Donor) | Title: "Moving Boxes", Category: `cardboard`, City: `Bengaluru` | Listing created with status `available`, rendered on Browse page | ✅ |
| `TC-LIST-02` | Recipient Create Listing | Logged in as Recipient, navigate to `/create-listing` | Client route guard redirects or backend rejects with 403 Forbidden | ✅ |
| `TC-LIST-03` | Edit Other User's Listing | User B attempts `PATCH /api/listings/:id` for User A's listing | HTTP 403 Forbidden: "Only the owner can modify this listing" | ✅ |
| `TC-LIST-04` | Image Upload Fallback | Upload image without Cloudinary credentials configured | Service writes to local `/uploads/`, returns accessible relative URL | ✅ |

### 3.3 Marketplace Discovery & Search

| Test ID | Scenario | Input / Action | Expected Result | Verified |
| :--- | :--- | :--- | :--- | :---: |
| `TC-BRW-01` | Fulltext Keyword Search | Search "pallet" | Only listings matching "pallet" in title/description are returned | ✅ |
| `TC-BRW-02` | Category Filter | Click "Cardboard & Paper" pill | Active filter shows only cardboard listings; updates URL query param | ✅ |
| `TC-BRW-03` | City Filter | Select "Mumbai" from dropdown | Listings filtered to Mumbai locations | ✅ |
| `TC-BRW-04` | Empty Search State | Search "nonexistent_term_xyz" | Friendly empty state with "No materials found" and "Clear filters" action | ✅ |

### 3.4 Reuse Proposal & Workflow Lifecycle

| Test ID | Scenario | Input / Action | Expected Result | Verified |
| :--- | :--- | :--- | :--- | :---: |
| `TC-INT-01` | Express Interest | Recipient opens modal on available listing, enters proposal message | Interest created with `pending` status, donor receives inbox notification | ✅ |
| `TC-INT-02` | Self-Interest Rejection | Donor attempts to express interest in their own item | UI disables button; API rejects with HTTP 400 | ✅ |
| `TC-INT-03` | Accept Proposal | Donor clicks "Accept Proposal" in Donor Dashboard | Interest status $\rightarrow$ `accepted`; listing status $\rightarrow$ `reserved` | ✅ |
| `TC-INT-04` | Archived / Reserved Block | User attempts to request item that is already `reserved` | API blocks creation: "Listing is no longer available" | ✅ |

### 3.5 AI Recommendations & Fault Tolerance

| Test ID | Scenario | Input / Action | Expected Result | Verified |
| :--- | :--- | :--- | :--- | :---: |
| `TC-REC-01` | Preference Alignment | User prefers `cardboard` in `Bengaluru` | Top recommendation is cardboard box in Bengaluru with 80%+ match | ✅ |
| `TC-REC-02` | Explainability Pill | View recommendation card | Card explicitly renders: "Why Recommended: Recommended because it matches..." | ✅ |
| `TC-REC-03` | Microservice Outage | Python microservice offline on port 8000 | Backend gracefully falls back to Rule-Based Baseline in <15ms; UI badge reflects fallback | ✅ |
| `TC-REC-04` | Audit Trail Persistence | Inspect PostgreSQL `match_results` | Generated score and reason recorded with timestamp and foreign key | ✅ |

---

## 4. Accessibility (a11y) & Usability Checklist

- [x] **Semantic HTML5:** Native `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>` elements used throughout.
- [x] **Headings Hierarchy:** Single `<h1>` per page, followed by logical `<h2>` and `<h3>` tags without skipping heading levels.
- [x] **Focus Ring States:** All interactive buttons and inputs feature explicit `focus:ring-2 focus:ring-emerald-500 focus:outline-none` styles.
- [x] **Image Alt Text:** All listing thumbnails and static illustrations supply descriptive `alt` attributes (`alt={item.title}`).
- [x] **Color Contrast:** Foreground text meets WCAG AA 4.5:1 ratio (Slate-900 / Slate-700 on White / Slate-50).
- [x] **Tap Target Sizes:** Touch targets on mobile navigation and buttons meet minimum $44 \times 44\text{px}$ requirements.
- [x] **Form Field Associations:** Form inputs have corresponding `<label>` tags with `htmlFor` identifiers.

---

## 5. Security & Input Sanitization Checklist

1. **SQL Injection Prevention:** 100% of database queries use parameterized SQL queries (`$1, $2, ...`) via `pg.Pool.query()`. No string concatenations.
2. **Password Security:** Hashes stored using `bcryptjs` with salt round work factor of 10. Passwords never returned in API payloads (`SELECT id, name, email, role, city...`).
3. **JWT Authentication:** Cryptographically signed tokens using `HS256` with 7-day expiration. Stored securely and validated via Bearer header.
4. **Ownership Enforcement:** Controllers strictly verify `listing.owner_id === req.user.id` before processing updates, deletions, or interest acceptances.
5. **Schema Validation:** Strict Zod parsing on all request bodies, query params, and route UUID params (`/api/listings/:id`).
6. **File Upload Hardening:** Multer rejects files $> 5\text{MB}$ and non-image MIME types (accepts only `image/jpeg`, `image/png`, `image/webp`).
