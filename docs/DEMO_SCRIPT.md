# GreenLoop — Viva Presentation & Demonstration Script

## 1. Presentation Outline & Timing (10–12 Minutes)

| Segment | Duration | Focus Area | Key Demonstrations |
| :--- | :---: | :--- | :--- |
| **1. Problem & Architecture** | 2 min | Introduction & System Design | • Waste diversion problem<br>• Decoupled architecture (React, Express, PostgreSQL, Python ML) |
| **2. Donor Journey** | 3 min | Listing Creation & Media | • Log in as Donor (`donor1@resourceai.org`)<br>• Create listing with image preview<br>• Donor dashboard metrics |
| **3. Recipient Discovery** | 2 min | Search, Filter & Catalog | • Filter by category & city<br>• Keyword search with real-time reactivity |
| **4. AI Recommendation System** | 3 min | Content-Based Matching | • Log in as Recipient (`recipient1@resourceai.org`)<br>• View recommendations with score & explainability reason pill<br>• Fallback circuit breaker demonstration |
| **5. Reuse Interest Workflow** | 2 min | State Transitions | • Submit reuse proposal<br>• Donor accepts proposal $\rightarrow$ status updates to `reserved` |
| **6. Examiner Q&A** | 3–5 min | Technical Defenses | • Database schema & constraints<br>• Why content-based vs supervised ML<br>• Security & JWT tokens |

---

## 2. Seed Demo Credentials

| Role | Email | Password | City | Preferences |
| :--- | :--- | :--- | :--- | :--- |
| **Donor (Warehouse)** | `donor1@resourceai.org` | `Password123!` | Bengaluru | Cardboard, Wood |
| **Donor (Studio)** | `donor2@resourceai.org` | `Password123!` | Mumbai | Textile, Glass |
| **Recipient (Student)** | `recipient1@resourceai.org` | `Password123!` | Bengaluru | Cardboard, Wood, Textile |
| **Recipient (NGO)** | `recipient2@resourceai.org` | `Password123!` | Mumbai | Glass, Plastic, Metal |
| **Platform Admin** | `admin@resourceai.org` | `AdminPassword123!` | Bengaluru | All Categories |

---

## 3. Step-by-Step Viva Demonstration Walkthrough

### Segment 1: Introduction & Live System Probe (2 Mins)
**Speaker Script:**
> *"Respected examiners, our final year project is GreenLoop — an AI-Powered Waste-to-Resource Platform. Millions of tons of clean industrial and household surplus like shipping boxes, wood offcuts, glass containers, and fabric remnants end up in landfills simply because donors have no direct, reliable channel to connect with local makers, students, and NGOs.*
> 
> *Our platform bridges this gap using a decoupled modern stack: a React Single-Page Application with Tailwind CSS, an Express REST API with Zod validation, a PostgreSQL relational database with ACID guarantees, and a hybrid content-based recommendation engine powered by Python scikit-learn with an automated 100-point rule-based fallback.*
> 
> *Here on the landing page, you can see our live System Probe widget, which connects to our Express backend at `localhost:5001/api/health`, confirming active PostgreSQL connectivity, memory statistics, and millisecond ping latency."*

**Action on Screen:**
1. Open `http://localhost:5173`.
2. Scroll to the **Live System Connectivity Probe** section.
3. Click **Re-check Connection** to show the live green ping status.

---

### Segment 2: Donor Experience — Creating a Material Listing (3 Mins)
**Speaker Script:**
> *"Now let's log in as a material donor, Rahul Sharma, who operates an eco-logistics warehouse in Bengaluru.*
> 
> *In the Donor Dashboard, Rahul can track his active surplus listings, reserved batches, and incoming reuse requests. Let's post a new surplus material listing."*

**Action on Screen:**
1. Click **Sign In** $\rightarrow$ Click **"Donor (Rahul)"** one-click demo button $\rightarrow$ Click **Sign In**.
2. Navigate to `/donor/dashboard` to show active listings.
3. Click **+ Post Material** (`/create-listing`):
   - Title: `Heavy Duty Plywood Offcuts`
   - Category: `Wood & Timber`
   - Type: `Plywood Offcuts`
   - Condition: `Good`
   - Quantity: `12 pieces (12mm thickness)`
   - City: `Bengaluru`
   - Description: `Clean untreated plywood scraps from shelf making. Dry, no rot.`
   - Photo: Select an image file or drop a sample URL.
4. Click **Publish Material Listing**.
5. Show the newly created item on `/donor/dashboard` with status badge `available`.

---

### Segment 3: Marketplace Discovery & Filtering (2 Mins)
**Speaker Script:**
> *"Let's visit the public marketplace at `/browse`. The platform provides multi-attribute filtering by category, municipal city, item condition, and instant keyword search.*
> 
> *Notice that searching for 'plywood' immediately isolates our new item without full page reloads, and selecting the 'Bengaluru' city filter filters out items in Mumbai."*

**Action on Screen:**
1. Navigate to `/browse`.
2. Type `plywood` in the search bar $\rightarrow$ show matching item.
3. Clear search and click the **Wood & Timber** pill $\rightarrow$ show wood items.
4. Click **Details** to view the rich listing page (`/listings/:id`) displaying donor info and material specifications.

---

### Segment 4: Explainable AI Recommendation Engine (3 Mins)
**Speaker Script:**
> *"Now we log in as Ananya Iyer, an architecture design student in Bengaluru looking for clean materials for model building.*
> 
> *Under `/recommendations`, our Explainable Recommendation Engine ranks all available items. Notice each card displays an explicit Match Score percentage and an Explainable Reason Pill — for example: 'Recommended because it matches your preferred category, cardboard, and is available locally in Bengaluru'.*
> 
> *In production systems, ML microservices can experience network latency. Our architecture features a 1500ms circuit breaker: if the Python FastAPI matcher is unreachable, Express seamlessly executes our 100-point rule-based algorithm (40 points category, 25 points city, 20 points keywords, 15 points recency). The user never sees a broken page."*

**Action on Screen:**
1. Sign out $\rightarrow$ Sign in using **"Recipient (Ananya)"** demo button.
2. Click **AI Matches** (`/recommendations`) in the navbar.
3. Highlight:
   - Active Matching Profile banner showing `City: Bengaluru` and `Categories: cardboard, wood, textile`.
   - The engine status badge (`scikit-learn` or `Explainable Rule-Based Baseline`).
   - The green `95% Match` score badge.
   - The **"Why Recommended"** explanation pill on each item.

---

### Segment 5: Reuse Proposal & State Transition (2 Mins)
**Speaker Script:**
> *"Ananya finds the cardboard boxes perfect for her diorama project. She clicks 'Express Interest', enters her project proposal and proposed pickup date, and submits.*
> 
> *When Rahul logs back into his Donor Dashboard, he sees the incoming proposal with Ananya's contact and message. When he clicks 'Accept', the proposal status updates to 'Accepted' and the listing automatically transitions from 'Available' to 'Reserved'. This prevents duplicate claims and ensures seamless physical logistics."*

**Action on Screen:**
1. On the recommendation card, click **Express Interest**.
2. Type: *"We need these boxes for our student exhibition this Friday. Can collect via rickshaw on Thursday morning."*
3. Click **Send Reuse Proposal**.
4. Switch to `/interests` $\rightarrow$ View proposal under **My Sent Requests** (`status: pending`).
5. Log out $\rightarrow$ Log in as Donor (`donor1@resourceai.org`) $\rightarrow$ Visit `/interests` $\rightarrow$ Click **Accept Proposal**.
6. Show that the listing status is now `reserved`.

---

## 4. Anticipated Technical Viva Questions & Defenses

### Question 1: "Why did you use Content-Based Filtering instead of Collaborative Filtering or a Supervised Neural Network?"
**Model Answer:**
> *"In a waste-to-resource platform, we face two critical domain realities:*
> 1. *The Cold-Start Problem: Early-stage platforms have zero historical interaction logs ($N_{\text{clicks}} \approx 0$). Supervised classifiers require large labeled datasets, which causes severe overfitting when trained on synthetic labels.*
> 2. *Transient Inventory: Unlike e-commerce where products persist for years, waste materials are unique, one-off surplus batches. Once an item is collected, it is gone forever. Collaborative filtering breaks down when item overlap across users is near zero.*
> 
> *Content-based filtering using TF-IDF vectorization and cosine similarity operates directly on item textual features and declared recipient preferences, making it completely immune to cold-start while providing 100% explainable recommendations."*

### Question 2: "How is data integrity guaranteed in PostgreSQL?"
**Model Answer:**
> *"We enforce data integrity at both the application and database tiers:*
> 1. *Database constraints: UUID primary keys, foreign keys with `ON DELETE CASCADE`, `NOT NULL` constraints, `UNIQUE(email)` for users, and check constraints (`status IN ('available', 'reserved', 'collected', 'archived')`).*
> 2. *Concurrency & Transactions: Status transitions (e.g., accepting an interest and reserving the listing) run within PostgreSQL transactions (`BEGIN ... COMMIT`) to prevent race conditions.*
> 3. *Indexing: B-Tree indexes on `owner_id`, `material_category`, `city`, and composite index on `(recipient_id, listing_id)` for sub-millisecond query performance."*

### Question 3: "What prevents SQL injection and unauthorized data modification?"
**Model Answer:**
> *"1. SQL Injection: 100% of database queries use parameterized SQL `$1, $2` via `pg.Pool`. No user input is ever concatenated into raw query strings.*
> *2. Validation: Zod schemas validate every request body and UUID route parameter before controllers execute.*
> *3. Ownership Authorization: For all mutations (`PATCH /api/listings/:id`, `DELETE`, `PATCH /api/interests/:id/status`), the controller queries the database and strictly verifies that `listing.owner_id === req.user.id`. Even if a user knows another listing's UUID, non-owners receive an HTTP 403 Forbidden."*

### Question 4: "What happens if Cloudinary credentials are missing or the API is down?"
**Model Answer:**
> *"Our media service features automatic local fallback. In `server/src/services/cloudinary.service.js`, the code inspects whether `CLOUDINARY_API_KEY` is configured. If absent or failing, the multer uploader saves the file directly into `server/uploads/` on local disk and generates a relative static URL served by Express (`/uploads/<filename>`). The application continues working uninterrupted."*
