# ReSource AI — User Manual & Operator Guide

## 1. Introduction

Welcome to **ReSource AI (AI-Powered Waste-to-Resource Platform)**. ReSource AI is a web application designed to accelerate the circular economy by connecting households, workshops, packaging facilities, and businesses with surplus reusable clean materials (cardboard boxes, glass jars, timber scraps, textiles, and plastic containers) to recipients (students, artists, makers, schools, and NGOs) who can repurpose them.

---

## 2. User Roles & Permissions

The platform supports three distinct roles:

| Role | Core Capabilities | Primary Interfaces |
| :--- | :--- | :--- |
| **Donor** | • Post surplus material listings with photos and descriptions<br>• Edit, update quantities, or archive listings<br>• View received interest requests from recipients<br>• Accept or decline pickup proposals (transitions listing to `reserved`) | Donor Dashboard (`/donor/dashboard`), Create Listing (`/create-listing`), Interests (`/interests`) |
| **Recipient** | • Browse, search, and filter materials across cities and categories<br>• Set creative preferences (preferred material categories & city)<br>• Receive explainable AI recommendations with transparent scores<br>• Express interest with collection timeline proposals | Marketplace (`/browse`), AI Matches (`/recommendations`), Interests (`/interests`), Dashboard (`/dashboard`) |
| **Admin** | • Future moderation role for reviewing flagged listings and platform-wide statistics. | Dashboard (`/dashboard`) |

---

## 3. Donor Guide: Listing & Giving Surplus Materials

### Step 1: Sign In or Register as a Donor
1. Navigate to `/login` or `/register`.
2. Enter your name, email, password, and select **Donor (Giving Materials)**.
3. Once logged in, your navbar will display a direct link to **Donor Dashboard** and a prominent **+ Post Surplus Material** button.

### Step 2: Post a Surplus Material Listing
1. Click **+ Post Material** in the navigation bar or go to `/create-listing`.
2. Fill out the listing form:
   - **Listing Title:** Enter a descriptive name (e.g., *Clean Corrugated Moving Boxes*).
   - **Material Category:** Select from `Cardboard & Paper`, `Wood & Timber`, `Glass Containers`, `Textile & Fabrics`, `Plastics & Polymers`, or `Surplus Hardware`.
   - **Specific Material Type:** e.g., *Double-wall boxes*, *Pallet offcuts*, *Sanitized Mason jars*.
   - **Condition Grade:** Choose `Like New`, `Good`, or `Fair`.
   - **Quantity & Dimensions:** Provide clear metrics (e.g., *35 boxes, flattened, ~50x40x30 cm*).
   - **Pickup City & Neighborhood:** e.g., *Bengaluru (Indiranagar)*.
   - **Material Description:** Detail cleanliness, previous use, and pickup constraints.
   - **Photograph:** Drop a photo file (JPEG/PNG/WebP under 5MB) or supply an image URL.
3. Click **Publish Material Listing**.
4. The item is saved directly into PostgreSQL with status `available` and appears instantly on the public marketplace.

### Step 3: Manage Your Active Listings
1. Visit `/donor/dashboard` to see all listings you have published.
2. Metrics cards display:
   - Total Active Items
   - Reserved Items awaiting pickup
   - Completed Collections
   - Total Incoming Interest Inquiries
3. Click **Edit Item** to adjust quantities or update descriptions.
4. Click **Archive** to remove an item from public search.

### Step 4: Review and Accept Recipient Proposals
1. When a recipient submits an interest request, a notification badge appears on the **Interests** navigation tab (`/interests`).
2. Review the recipient's message, workshop location, and proposed collection date.
3. Click **Accept Proposal**:
   - The proposal status changes to `accepted`.
   - The listing status automatically updates to `reserved` to prevent multiple recipients from competing for the same batch.
   - Coordinate final pickup with the recipient.
4. If unable to fulfill, click **Decline Proposal** to release the request cleanly.

---

## 4. Recipient Guide: Discovering & Requesting Materials

### Step 1: Set Your Reuse Preferences
1. Go to your **Profile Dashboard** (`/dashboard`).
2. Set your **Home / Workshop City** (e.g., *Bengaluru*).
3. Toggle your **Preferred Categories** (e.g., *Cardboard & Paper*, *Wood & Timber*).
4. Click **Save Preferences**.
5. The recommendation engine immediately tunes its algorithm to prioritize these attributes!

### Step 2: Browse the Material Marketplace
1. Click **Browse Materials** (`/browse`).
2. Use interactive discovery filters:
   - **Search Bar:** Real-time keyword search across title, description, and material type.
   - **Category Pills:** Filter specifically for cardboard, timber, glass, textile, or plastic.
   - **City Dropdown:** View listings available in your local municipal area.
   - **Condition Filter:** Filter for `Like New` items if sanitized packaging is required.
3. Click on any card to view the **Listing Details Page** (`/listings/:id`) with full specifications, donor profile, and timestamp.

### Step 3: View Explainable AI Recommendations
1. Click **AI Matches** (`/recommendations`) in the navbar.
2. The system computes a personalized ranking using either:
   - The **Python scikit-learn TF-IDF + Cosine Similarity** engine.
   - The **100-Point Rule-Based Baseline Engine** (Category 40pt + City 25pt + Keywords 20pt + Recency 15pt).
3. Each recommended card highlights:
   - **Match Percentage Badge:** e.g., `95% Match` (Green for 80%+, Teal for 50-79%).
   - **Why Recommended Pill:** Transparent, plain-English explanation (e.g., *Recommended because it matches your preferred category, cardboard, and is available locally in Bengaluru.*).

### Step 4: Submit an Interest Proposal
1. Click **Express Interest** on any available listing.
2. A modal opens with prompt guidance.
3. Enter your reuse purpose:
   > *"Hello Anita! I run an art studio for school students and we need clean cardboard for an architectural diorama project. We can arrange electric rickshaw pickup this Saturday morning."*
4. Click **Send Reuse Proposal**.
5. The request is recorded under your **Interests** tab (`/interests`) under *My Sent Requests*.

---

## 5. System Probe & Diagnostics

On the landing page (`/`), an interactive **Live System Probe** widget continuously reports:
- Backend Express REST API connectivity
- PostgreSQL database health and round-trip ping latency
- Server uptime and Node.js environment mode
- Click **Re-check Connection** at any time to run an active diagnosis.

---

## 6. Frequently Asked Questions (FAQ)

**Q: Can I express interest in my own listing?**  
*A: No. ReSource AI enforces strict role separation and business logic; donors cannot send proposals for materials they have posted.*

**Q: What happens when a donor accepts my proposal?**  
*A: The listing status changes to `reserved` so other users know the item is committed. You will see the status update to `Accepted` in your Interests tab.*

**Q: What if the Python ML microservice is offline?**  
*A: The platform includes an automated circuit breaker. If the Python matcher does not respond within 1500ms, the Express server seamlessly computes recommendations using the 100-point rule-based algorithm. The UI remains fully functional.*

**Q: How do image uploads work without a Cloudinary account?**  
*A: The platform contains an automated local storage fallback. If Cloudinary credentials are not present in `.env`, images are written directly to `server/uploads/` and served via static URL.*
