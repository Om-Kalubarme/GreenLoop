# ReSource AI — System Architecture Specification

---

## 1. Architectural Overview & Design Principles

ReSource AI follows a **modular multi-tier distributed architecture** composed of four decoupled subsystems:
1. **Client Tier (Presentation):** Single-page web application built with React.js, Vite, and Tailwind CSS.
2. **Application Tier (Business Logic):** RESTful API server built with Node.js and Express.js, implementing JWT security, input validation with Zod, and service orchestration.
3. **Data Tier (Persistence):** ACID-compliant PostgreSQL relational database with connection pooling, migrations, and declarative indexes.
4. **Intelligence Tier (Recommendation Service):** Dual-layer engine comprising an internal Node.js 100-point explainable rule-based scorer and an optional external Python microservice running scikit-learn (TF-IDF vectorizer + Cosine Similarity).

```mermaid
flowchart TD
    subgraph Users [End Users]
        DonorBrowser[Donor Web Client]
        RecipientBrowser[Recipient Web Client]
    end

    subgraph Client [React + Vite SPA]
        ViteApp[Client React SPA]
        TailwindStyles[Tailwind CSS Design Tokens]
        AxiosClient[Axios HTTP Client with JWT Interceptors]
    end

    subgraph API [Node.js Express Server]
        Router[Express Router]
        AuthGuard[JWT Auth Guard & Role Middleware]
        Validator[Zod Payload Validator]
        ListingCtrl[Listings Controller]
        InterestCtrl[Interests Controller]
        RecCtrl[Recommendations Controller]
        RuleEngine[Explainable Rule-Based Scorer]
        CloudinarySvc[Cloudinary Upload Service]
    end

    subgraph External [External Cloud Services]
        CloudinaryCDN[Cloudinary Media CDN]
    end

    subgraph Data [PostgreSQL Database]
        Tables[(PostgreSQL Schema<br/>users, listings, interests, match_results)]
    end

    subgraph ML [Python Machine Learning Service]
        FastAPIApp[FastAPI Microservice]
        TFIDF[scikit-learn TfidfVectorizer & Cosine Similarity]
    end

    DonorBrowser --> ViteApp
    RecipientBrowser --> ViteApp
    ViteApp --> TailwindStyles
    ViteApp --> AxiosClient
    AxiosClient -->|JSON / HTTPS| Router
    Router --> AuthGuard
    AuthGuard --> Validator
    Validator --> ListingCtrl
    Validator --> InterestCtrl
    Validator --> RecCtrl

    ListingCtrl -->|CRUD Queries| Tables
    ListingCtrl -->|Upload Buffer| CloudinarySvc
    CloudinarySvc --> CloudinaryCDN

    InterestCtrl -->|Insert / Query| Tables

    RecCtrl -->|Query Active Listings & User Profile| Tables
    RecCtrl -->|HTTP POST /rank with 1.5s timeout| FastAPIApp
    FastAPIApp --> TFIDF
    RecCtrl -.->|On Timeout or Error: Fallback| RuleEngine
```

---

## 2. Entity Relationship (ER) Model

```mermaid
erDiagram
    USERS ||--o{ LISTINGS : "owns / posts"
    USERS ||--o{ INTERESTS : "creates / submits"
    USERS ||--o{ MATCH_RESULTS : "receives"
    LISTINGS ||--o{ INTERESTS : "target of"
    LISTINGS ||--o{ MATCH_RESULTS : "scored in"

    USERS {
        uuid id PK "Primary key (gen_random_uuid())"
        varchar name "Full name of person or organisation"
        varchar email UK "Unique login email"
        varchar password_hash "Bcrypt salted hash (cost 10)"
        varchar role "Role enum: donor, recipient, admin"
        varchar city "Primary operational city"
        text_array preferred_categories "Array of categories of interest"
        timestamp created_at "Registration timestamp"
    }

    LISTINGS {
        uuid id PK "Primary key (gen_random_uuid())"
        uuid owner_id FK "References users(id) ON DELETE CASCADE"
        varchar title "Descriptive title of discarded material"
        varchar material_category "cardboard, plastic, glass, wood, textile, metal, other"
        varchar material_type "Specific type e.g. Corrugated boxes, Pallet wood"
        varchar condition "Brand New, Like New, Good, Fair, Salvage"
        varchar quantity_description "e.g. 50 kg, 30 boxes, 10 crates"
        text description "Detailed dimensions, cleanliness, pickup terms"
        varchar city "Pickup location city"
        varchar image_url "Direct CDN or hosted image URL"
        varchar cloudinary_public_id "Cloudinary asset identifier for cleanup"
        varchar status "available, reserved, collected, archived"
        timestamp created_at "Creation timestamp"
        timestamp updated_at "Last updated timestamp"
    }

    INTERESTS {
        uuid id PK "Primary key (gen_random_uuid())"
        uuid listing_id FK "References listings(id) ON DELETE CASCADE"
        uuid recipient_id FK "References users(id) ON DELETE CASCADE"
        text message "Explanation of intended reuse & collection proposal"
        varchar status "pending, accepted, declined"
        timestamp created_at "Submission timestamp"
    }

    MATCH_RESULTS {
        uuid id PK "Primary key (gen_random_uuid())"
        uuid listing_id FK "References listings(id) ON DELETE CASCADE"
        uuid user_id FK "References users(id) ON DELETE CASCADE"
        numeric score "Calculated match score (0.0 to 100.0)"
        text reason "Explainable human-readable justification string"
        timestamp generated_at "Calculation timestamp"
    }
```

---

## 3. End-to-End Sequence Diagrams

### Sequence 1: Donor Registers, Uploads Photo, and Creates Listing

```mermaid
sequenceDiagram
    autonumber
    actor Donor as Donor User
    participant Browser as React SPA
    participant Server as Express Server
    participant Cloudinary as Cloudinary API
    participant DB as PostgreSQL

    Donor->>Browser: Fills registration form (name, email, password, role=donor, city)
    Browser->>Server: POST /api/auth/register
    Server->>Server: Hash password with bcrypt(10)
    Server->>DB: INSERT INTO users (...)
    DB-->>Server: User record created
    Server-->>Browser: 201 Created + JWT token
    Browser->>Browser: Persist JWT in localStorage

    Donor->>Browser: Selects image file for listing
    Browser->>Server: POST /api/uploads/image (multipart/form-data with JWT)
    Server->>Cloudinary: Upload stream buffer
    Cloudinary-->>Server: Return { secure_url, public_id }
    Server-->>Browser: 200 OK { imageUrl, publicId }

    Donor->>Browser: Submits listing form (title, category, type, condition, city, description)
    Browser->>Server: POST /api/listings (JSON payload + imageUrl + JWT)
    Server->>Server: Zod schema validation
    Server->>DB: INSERT INTO listings (owner_id, title, category, ...)
    DB-->>Server: Listing created with status 'available'
    Server-->>Browser: 201 Created { listing }
    Browser->>Donor: Show confirmation & redirect to listing detail
```

---

### Sequence 2: Recipient Browses, Explores Explainable Recommendations, and Expresses Interest

```mermaid
sequenceDiagram
    autonumber
    actor Recipient as Recipient User
    participant Browser as React SPA
    participant Server as Express Server
    participant ML as Python Matcher Microservice
    participant DB as PostgreSQL

    Recipient->>Browser: Navigates to "Recommended For You"
    Browser->>Server: GET /api/recommendations (with JWT)
    Server->>DB: Fetch active listings (status = 'available')
    Server->>DB: Fetch recipient profile (preferred_categories, city)
    
    alt Python ML Service Online
        Server->>ML: POST /rank { listings, recipient_profile } (timeout: 1500ms)
        ML->>ML: Vectorize text using TfidfVectorizer & compute cosine similarity
        ML-->>Server: Ranked listings with similarity scores & explanations
    else Python ML Service Offline or Timed Out
        Server->>Server: Execute Rule-Based Scorer (40pt cat, 25pt city, 20pt kw, 15pt recency)
        Server->>Server: Generate human-readable explanation strings
    end

    Server-->>Browser: Return sorted recommendations with scores & reasons
    Browser->>Recipient: Render cards with match score badge & explanation text

    Recipient->>Browser: Clicks "Express Interest", inputs message
    Browser->>Server: POST /api/listings/:id/interests { message }
    Server->>DB: INSERT INTO interests (listing_id, recipient_id, message, status='pending')
    DB-->>Server: Saved interest record
    Server-->>Browser: 201 Created { interest }
    Browser->>Recipient: Display success message "Interest request sent to donor"
```

---

## 4. REST API Endpoint Specification

### Public Endpoints
* `GET /api/health`: Health probe returning system status, database latency, and timestamp.
* `POST /api/auth/register`: Create user account. Returns `{ token, user }`.
* `POST /api/auth/login`: Authenticate credentials. Returns `{ token, user }`.
* `GET /api/listings`: Paginated listing catalog with query filters:
  * `?category=cardboard`
  * `?city=Bengaluru`
  * `?condition=Good`
  * `?search=shipping+boxes`
  * `?page=1&limit=12`
* `GET /api/listings/:id`: Fetch single listing details with public donor metadata.

### Authenticated Endpoints (Requires `Authorization: Bearer <token>`)
* `GET /api/auth/me`: Get profile of authenticated user.
* `PATCH /api/users/me`: Update profile fields (`name`, `city`, `preferred_categories`).
* `POST /api/uploads/image`: Upload listing photo (multipart file `image`).
* `POST /api/listings`: Create new listing (must be `donor` or `admin`).
* `PATCH /api/listings/:id`: Update listing (must be listing owner or `admin`).
* `DELETE /api/listings/:id`: Archive/delete listing (must be listing owner or `admin`).
* `POST /api/listings/:id/interests`: Submit interest request with message.
* `GET /api/listings/:id/interests`: Retrieve interest requests for a specific listing (owner only).
* `GET /api/users/me/interests`: Retrieve interest requests sent or received by the user.
* `PATCH /api/interests/:id/status`: Update interest status (`accepted`, `declined`).
* `GET /api/recommendations`: Retrieve ranked listing recommendations with transparent explanations.

---

## 5. Scope Boundaries: MVP Scope vs. Non-Goals

| Feature Category | In Scope (MVP Release) | Non-Goals (Future Extensions) |
| :--- | :--- | :--- |
| **Monetary Transactions** | 100% Free / Direct Barter (no payment gateway) | Integrated escrow or marketplace payments |
| **Communication** | Structured Interest Request forms with status tracking | Live WebSocket instant chat / voice calls |
| **Location / Mapping** | City-level matching & textual address pickup details | Live GPS tracking, map route navigation, courier API |
| **Machine Learning** | Content-based TF-IDF + Cosine Similarity + Rule-based fallback | Deep neural networks, image vision models, collaborative filtering |
| **Platforms** | Fully responsive web app (mobile, tablet, desktop) | Native iOS/Android app store packages |

---

## 6. User Roles, User Stories, and Acceptance Gates

### Role 1: Material Donor
* **User Story:** "As a restaurant manager, I want to list clean 20-liter oil tins with photos so that an upcycling gardener or artisan can collect them."
* **Acceptance Gate:**
  * Listing is created with photo, quantity, city, and status `available`.
  * Listing is immediately visible in marketplace search and donor dashboard.
  * Donor receives interest requests from recipients and can mark the item as `reserved`.

### Role 2: Material Recipient
* **User Story:** "As an architecture student, I want to find free cardboard sheets in my city with a clear explanation of why they match my project."
* **Acceptance Gate:**
  * Recipient configures preferred categories (`cardboard`) and city (`Pune`).
  * System recommends matching listings with a visible badge ("Match Score: 95/100") and human-readable reason.
  * Recipient submits an interest message and receives confirmation.

### Role 3: Platform Administrator
* **User Story:** "As an administrator, I want to verify system health and archive fraudulent listings to maintain platform safety."
* **Acceptance Gate:**
  * Access protected admin overview.
  * View total registered users, active listings, and interest counts.
  * Archive or remove listings violating community guidelines.
