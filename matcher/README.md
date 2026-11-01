# GreenLoop — Recommendation Matcher Microservice (Python)

This service provides content-based recommendation ranking using **scikit-learn**, **TF-IDF vectorization**, and **Cosine Similarity**.

## Overview
- **Algorithm:** Textual feature representation $\to$ `TfidfVectorizer` (unigrams + bigrams) $\to$ `cosine_similarity` matrix calculation.
- **Explainability:** Generates deterministic natural language explanations describing why items match recipient preferences.
- **Fault-Tolerance:** The Node.js Express backend can run with or without this service. If this service is offline, the backend automatically uses its built-in 100-point rule-based scorer.

## Setup Instructions

1. **Create and Activate Virtual Environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Self-Test / Unit Tests:**
   ```bash
   python rank.py
   python3 -m unittest discover tests/
   ```

4. **Start Microservice:**
   ```bash
   python app.py
   ```
   Service listens on `http://localhost:8000`.

## API Contract

### `GET /health`
Returns service availability status.

### `POST /rank`
Request body:
```json
{
  "listings": [
    {
      "id": "1",
      "title": "Clean Cardboard Boxes",
      "material_category": "cardboard",
      "material_type": "Corrugated",
      "city": "Bengaluru",
      "condition": "Good",
      "description": "50 clean boxes"
    }
  ],
  "recipient_profile": {
    "city": "Bengaluru",
    "preferred_categories": ["cardboard"],
    "keywords": "packaging"
  },
  "top_n": 10
}
```
