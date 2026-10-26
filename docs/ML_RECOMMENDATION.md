# ReSource AI — Recommendation System Specification & ML Design Report

## 1. System Overview

ReSource AI features an **Explainable Hybrid Recommendation Architecture** designed specifically for a circular waste-to-resource marketplace. The engine matches surplus material listings posted by donors (e.g., discarded corrugated cardboard, industrial wood pallets, sanitized glass containers, fabric remnants) with prospective recipients (students, makers, NGOs, schools, and circular artisans).

The recommendation system is structured into two complementary layers:
1. **Tier 1 (Mandatory Baseline): Explainable 100-Point Rule-Based Engine (Node.js/Express)**
   - Operates synchronously inside the backend API.
   - Guaranteed sub-10ms response time with zero external network dependencies.
   - 100% transparent and deterministic score breakdown.
2. **Tier 2 (AI/ML Enhancement): Content-Based Vector Similarity (Python / scikit-learn / FastAPI)**
   - Microservice leveraging `TfidfVectorizer` and `cosine_similarity`.
   - Semantic text feature analysis across titles, categories, condition grades, and descriptions.
   - Communicates with Express via a non-blocking HTTP proxy with an automated circuit breaker (1500ms timeout) that gracefully falls back to Tier 1 if offline.

---

## 2. Why Content-Based Recommendation Instead of a Supervised Predictive Model?

In university capstones and production machine learning evaluations, justifying model selection is crucial. ReSource AI intentionally uses **Content-Based Filtering (Unsupervised Vector Space Model)** rather than a supervised classifier (e.g., Logistic Regression, Random Forest, XGBoost, or Deep Neural Networks):

### A. The Cold-Start Dilemma
- **Supervised models require labeled target variables** (e.g., $Y \in \{0, 1\}$ denoting whether user $U$ completed a material pickup for listing $L$).
- A brand new or growing platform has zero or very sparse historical interaction logs ($N_{\text{interactions}} \approx 0$).
- Training a supervised model on synthetic or sparse labels produces extreme overfitting, label noise, and non-generalizable parameters.
- Content-based filtering operates on **item metadata and declared recipient preferences**, completely immune to the user cold-start problem.

### B. Material Uniqueness and Transient Inventory
- Discarded materials are heterogeneous and one-off batches (e.g., "50 clean shipping boxes from a warehouse move" is a temporary listing, not a persistent SKU like a book on Amazon).
- Once a listing is reserved and collected, it exits the catalog. Collaborative filtering (matrix factorization / ALS) breaks down when item overlap across users is near zero.
- Content-based vectorization represents the **intrinsic textual attributes** of the item, making it ideal for unique, non-repeating inventory.

### C. Transparency and Algorithmic Explainability
- Recipients need to know *why* an item was recommended (e.g., "Matches your preferred category: cardboard, and is available in your city: Bengaluru").
- Black-box neural models or complex ensembles obscure feature attribution, hindering trust.
- In academic evaluation, explainable AI (XAI) ensures academic rigor and clear viva demonstrations.

---

## 3. Mathematical Foundations & Algorithms

### 3.1 Tier 1: 100-Point Rule-Based Baseline Engine

For listing $i$ and recipient profile $u$, the baseline score $S_{\text{rule}}(i, u)$ is computed via a weighted linear combination:

$$S_{\text{rule}}(i, u) = W_{\text{cat}} \cdot C(i, u) + W_{\text{city}} \cdot L(i, u) + W_{\text{kw}} \cdot K(i, u) + W_{\text{rec}} \cdot R(i)$$

Where:
- **Category Match ($W_{\text{cat}} = 40$)**:
  $$C(i, u) = \begin{cases} 1 & \text{if } \text{category}(i) \in \text{preferred\_categories}(u) \\ 0 & \text{otherwise} \end{cases}$$
- **City Proximity ($W_{\text{city}} = 25$)**:
  $$L(i, u) = \begin{cases} 1 & \text{if } \text{city}(i) = \text{city}(u) \\ 0 & \text{otherwise} \end{cases}$$
- **Keyword Relevance ($W_{\text{kw}} = 20$)**:
  $$K(i, u) = \begin{cases} 1 & \text{if any } k \in \text{preferred\_categories}(u) \subset \text{text}(i) \\ 0 & \text{otherwise} \end{cases}$$
- **Recency Decay ($W_{\text{rec}} = 15$)**:
  $$R(i) = \begin{cases} 
    1.0 & \text{if } \Delta t \le 3 \text{ days} \\
    0.67 & \text{if } 3 < \Delta t \le 7 \text{ days} \\
    0.33 & \text{if } 7 < \Delta t \le 14 \text{ days} \\
    0.0 & \text{if } \Delta t > 14 \text{ days}
  \end{cases}$$

Maximum possible score = $40 + 25 + 20 + 15 = 100$.

---

### 3.2 Tier 2: TF-IDF Vectorization & Cosine Similarity

#### Step 1: Composite Document Construction
Each candidate listing $i$ is transformed into a dense structured document $D_i$:

$$D_i = [\text{title}] + 2 \times [\text{category}] + 2 \times [\text{material\_type}] + [\text{condition}] + [\text{city}] + [\text{quantity}] + [\text{description}]$$

The recipient profile $u$ is transformed into a query document $Q_u$:

$$Q_u = 2 \times [\text{preferred\_categories}] + [\text{city}] + [\text{keywords}]$$

*(Categories are repeated $2\times$ during preprocessing to give them higher term frequency weight in the vector space).*

#### Step 2: TF-IDF Calculation
For term $t$ in document $d$ within corpus $\mathcal{D}$:

$$\text{TF}(t, d) = \frac{f_{t, d}}{\sum_{t' \in d} f_{t', d}}$$

$$\text{IDF}(t, \mathcal{D}) = \ln\left(\frac{1 + |\mathcal{D}|}{1 + |\{d \in \mathcal{D} : t \in d\}|}\right) + 1$$

$$\text{TF-IDF}(t, d, \mathcal{D}) = \text{TF}(t, d) \times \text{IDF}(t, \mathcal{D})$$

Vector $\vec{v}_i$ and query vector $\vec{q}_u$ are $L_2$-normalized:

$$\|\vec{v}\|_2 = \sqrt{\sum_{k} v_k^2} = 1.0$$

#### Step 3: Cosine Similarity Metric
The cosine angle between the recipient query vector $\vec{q}_u$ and candidate listing vector $\vec{v}_i$ is:

$$\text{Sim}(\vec{q}_u, \vec{v}_i) = \cos(\theta) = \frac{\vec{q}_u \cdot \vec{v}_i}{\|\vec{q}_u\|_2 \|\vec{v}_i\|_2} = \sum_{k} q_{u, k} \cdot v_{i, k}$$

Where $\text{Sim}(\vec{q}_u, \vec{v}_i) \in [0.0, 1.0]$.

#### Step 4: Hybrid Composite Scoring
To honor physical location constraints and explicit category tags alongside textual semantic similarity:

$$S_{\text{ML}}(i, u) = \min\left(100.0, \; \text{round}\left(50.0 \cdot \text{Sim}(\vec{q}_u, \vec{v}_i) + 30.0 \cdot C(i, u) + 20.0 \cdot L(i, u), 1\right)\right)$$

---

## 4. Pipeline & Fallback Circuit Breaker Architecture

```
[ Recipient requests GET /api/recommendations ]
                     │
                     ▼
  [ Node.js Controller: verify JWT & fetch user preferences ]
                     │
                     ▼
  [ Fetch available listings from PostgreSQL (WHERE status='available') ]
                     │
                     ├──────────────────────────────┐
                     ▼                              ▼
      [ Try Python Matcher Microservice ]   [ Catch / Timeout (1500ms) ]
      [ POST http://localhost:8000/rank ]           │
                     │                              ▼
         ┌───────────┴──────────┐       [ Fallback to Node.js 100-pt ]
         ▼                      ▼       [ Rule-Based Scoring Engine  ]
   [ HTTP 200 OK ]         [ Error /                │
   [ ML Scores   ]         [ Timeout ]              │
         │                      │                   │
         └──────────┬───────────┘                   │
                    │                               │
                    ▼                               ▼
       [ Format Top N Ranked Listings with Explainable Reasons ]
                    │
                    ▼
       [ Audit Log Top 3 to match_results Table ]
                    │
                    ▼
       [ Return JSON to Frontend with Engine Badge ]
```

### Circuit Breaker Specifications:
- **Timeout Threshold:** 1500ms
- **Failure Mode:** Log warning, immediately compute rule-based score, and set response header `engine: "Explainable Rule-Based Baseline (Fallback)"`.
- **Client Resilience:** Frontend displays an informational badge indicating whether recommendations are powered by `scikit-learn` or the deterministic fallback engine.

---

## 5. Input, Preprocessing, and Output Specifications

### 5.1 Input Schema
```json
{
  "listings": [
    {
      "id": "e43b6791-c6f9-467f-9ce0-496e62551e3f",
      "title": "Clean Heavy Duty Cardboard Shipping Boxes",
      "material_category": "cardboard",
      "material_type": "Corrugated",
      "condition": "Good",
      "quantity_description": "50 boxes",
      "description": "Clean warehouse packaging surplus suitable for moving or school dioramas.",
      "city": "Bengaluru",
      "created_at": "2026-10-25T10:00:00Z"
    }
  ],
  "recipient_profile": {
    "city": "Bengaluru",
    "preferred_categories": ["cardboard", "wood"],
    "keywords": "student art workshop"
  },
  "top_n": 10
}
```

### 5.2 Preprocessing Steps
1. **Case Normalization:** Convert all strings to lowercase.
2. **Special Character Stripping:** Remove punctuation, control characters, and regex markers via `[^\w\s]`.
3. **Stop Word Removal:** Filter common English stop words (`the`, `and`, `is`, `in`, `at`, `of`).
4. **Sublinear TF Scaling:** Replace term frequency $tf$ with $1 + \log(tf)$ to prevent multi-word repetitions in spam listings from skewing cosine angles.
5. **N-gram Range:** Extract unigrams and bigrams (`(1, 2)`) to capture compound terms like `clean boxes` or `solid pine`.

### 5.3 Output Schema
```json
{
  "success": true,
  "engine": "scikit-learn (TF-IDF + Cosine Similarity)",
  "count": 1,
  "recommendations": [
    {
      "id": "e43b6791-c6f9-467f-9ce0-496e62551e3f",
      "title": "Clean Heavy Duty Cardboard Shipping Boxes",
      "material_category": "cardboard",
      "city": "Bengaluru",
      "score": 92.4,
      "cosine_similarity": 0.448,
      "reason": "Recommended (Score: 92/100) because it matches your interest in 'cardboard' and is located nearby in Bengaluru."
    }
  ]
}
```

---

## 6. Audit Logging in PostgreSQL (`match_results`)

To ensure traceability, accountability, and debugging during viva demonstrations, every recommendation request records the top matches into the `match_results` table:

```sql
INSERT INTO match_results (listing_id, user_id, score, reason)
VALUES ('e43b6791-c6f9-467f-9ce0-496e62551e3f', 'a19b...', 92.4, 'Recommended because it matches your preferred category, cardboard, and is available in Bengaluru.');
```

This guarantees an immutable audit trail for research evaluations and academic viva review.

---

## 7. Known Limitations & Future Enhancements

1. **Geographic Coordinate Distance:**
   - *Current Limitation:* City matching is categorical (exact string match).
   - *Future Enhancement:* PostGIS integration using Haversine radial distance (e.g., within 15 km radius).
2. **Image Embeddings (Multimodal):**
   - *Current Limitation:* Vectorization operates purely on textual listings and category tags.
   - *Future Enhancement:* Contrastive Language-Image Pretraining (CLIP) or Vision Transformer (ViT) embeddings to compare photos of material scraps against aesthetic mood boards.
3. **Implicit Feedback Loops:**
   - *Future Enhancement:* When a recipient sends an interest request, record positive interaction feedback to dynamically update the user's preference vector weights.
