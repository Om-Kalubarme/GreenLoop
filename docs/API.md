# ReSource AI — REST API Documentation

Base URL: `http://localhost:5001/api`

---

## 1. Health & System Diagnostic Endpoints

### `GET /api/health`
Checks overall server status, PostgreSQL database connectivity, and recommendation matcher availability.

* **Access:** Public
* **Sample Response (HTTP 200 OK):**
```json
{
  "status": "ok",
  "service": "ReSource AI Backend API",
  "uptimeSeconds": 120,
  "timestamp": "2026-10-26T10:30:00.000Z",
  "database": {
    "connected": true,
    "latencyMs": 8
  },
  "matcherService": "offline (rule-based fallback active)",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## 2. Authentication & User Endpoints

### `POST /api/auth/register`
Register a new donor or recipient account. Issues a signed JWT token on success.

* **Access:** Public
* **Request Body:**
```json
{
  "name": "Ananya Iyer",
  "email": "ananya@example.com",
  "password": "Password123!",
  "role": "recipient",
  "city": "Bengaluru",
  "preferred_categories": ["cardboard", "wood"]
}
```
* **Sample Response (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "33333333-3333-3333-3333-333333333333",
    "name": "Ananya Iyer",
    "email": "ananya@example.com",
    "role": "recipient",
    "city": "Bengaluru",
    "preferred_categories": ["cardboard", "wood"],
    "created_at": "2026-10-26T10:30:00.000Z"
  }
}
```
* **Error Response (HTTP 409 Conflict):**
```json
{
  "success": false,
  "error": "An account with this email address already exists"
}
```

---

### `POST /api/auth/login`
Authenticate credentials and obtain a JWT bearer token.

* **Access:** Public
* **Request Body:**
```json
{
  "email": "ananya@example.com",
  "password": "Password123!"
}
```
* **Sample Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "33333333-3333-3333-3333-333333333333",
    "name": "Ananya Iyer",
    "email": "ananya@example.com",
    "role": "recipient",
    "city": "Bengaluru",
    "preferred_categories": ["cardboard", "wood"]
  }
}
```

---

### `GET /api/auth/me`
Retrieve currently authenticated user's profile.

* **Access:** Authenticated (Requires `Authorization: Bearer <token>`)
* **Sample Response (HTTP 200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "33333333-3333-3333-3333-333333333333",
    "name": "Ananya Iyer",
    "email": "ananya@example.com",
    "role": "recipient",
    "city": "Bengaluru",
    "preferred_categories": ["cardboard", "wood"],
    "created_at": "2026-10-26T10:30:00.000Z"
  }
}
```

---

### `PATCH /api/users/me`
Update operational city and preferred categories.

* **Access:** Authenticated
* **Request Body:**
```json
{
  "city": "Mumbai",
  "preferred_categories": ["glass", "textile", "wood"]
}
```
* **Sample Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "33333333-3333-3333-3333-333333333333",
    "name": "Ananya Iyer",
    "email": "ananya@example.com",
    "role": "recipient",
    "city": "Mumbai",
    "preferred_categories": ["glass", "textile", "wood"]
  }
}
```

---

## 3. Listings Endpoints

### `GET /api/listings`
Retrieve paginated listings with optional multi-facet filtering and full-text keyword search.

* **Access:** Public
* **Query Parameters:**
  * `search` (string, optional): Search keyword matching against title, description, and material type.
  * `category` (enum, optional): `cardboard`, `plastic`, `glass`, `wood`, `textile`, `metal`, `other`.
  * `city` (string, optional): Case-insensitive city name (e.g. `Bengaluru`, `Mumbai`).
  * `condition` (enum, optional): `Brand New`, `Like New`, `Good`, `Fair`, `Salvage`.
  * `status` (enum, optional, default: `available`): `available`, `reserved`, `collected`, `archived`.
  * `page` (integer, optional, default: `1`): Page number.
  * `limit` (integer, optional, default: `12`, max: `50`): Results per page.

* **Sample Request:**
```http
GET /api/listings?category=cardboard&city=Bengaluru&page=1&limit=10 HTTP/1.1
Host: localhost:5001
```

* **Sample Response (HTTP 200 OK):**
```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  },
  "listings": [
    {
      "id": "a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "owner_id": "11111111-1111-1111-1111-111111111111",
      "title": "Clean Heavy-Duty Corrugated Shipping Boxes",
      "material_category": "cardboard",
      "material_type": "Corrugated Double-Wall Boxes",
      "condition": "Good",
      "quantity_description": "45 large boxes",
      "description": "Clean, flattened brown shipping boxes from electronic delivery...",
      "city": "Bengaluru",
      "image_url": "https://images.unsplash.com/...",
      "status": "available",
      "created_at": "2026-10-25T10:30:00.000Z",
      "donor_name": "Rahul Sharma (Eco Logistics)",
      "donor_city": "Bengaluru"
    }
  ]
}
```

---

### `GET /api/listings/:id`
Retrieve detailed listing information including donor contact details.

* **Access:** Public
* **URL Parameter:** `id` (UUID)
* **Sample Response (HTTP 200 OK):**
```json
{
  "success": true,
  "listing": {
    "id": "a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "owner_id": "11111111-1111-1111-1111-111111111111",
    "title": "Clean Heavy-Duty Corrugated Shipping Boxes",
    "material_category": "cardboard",
    "material_type": "Corrugated Double-Wall Boxes",
    "condition": "Good",
    "quantity_description": "45 large boxes",
    "description": "Clean, flattened brown shipping boxes...",
    "city": "Bengaluru",
    "image_url": "https://images.unsplash.com/...",
    "cloudinary_public_id": null,
    "status": "available",
    "created_at": "2026-10-25T10:30:00.000Z",
    "updated_at": "2026-10-25T10:30:00.000Z",
    "donor_name": "Rahul Sharma (Eco Logistics)",
    "donor_email": "donor1@resourceai.org",
    "donor_city": "Bengaluru",
    "donor_role": "donor"
  }
}
```

* **Error Response (HTTP 404 Not Found):**
```json
{
  "success": false,
  "error": "Listing not found"
}
```

* **Error Response (HTTP 400 Bad Request — Invalid UUID):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "id",
      "message": "Invalid listing ID format, must be a valid UUID"
    }
  ]
}
```
