"""
ReSource AI — Content-Based Recommendation Module
==================================================

Overview:
---------
This module implements content-based filtering for material listings using:
1. scikit-learn's TfidfVectorizer (Term Frequency-Inverse Document Frequency)
2. Cosine Similarity between listing textual feature profiles and recipient preference profiles.

Why Content-Based Filtering instead of a Supervised Predictive Model?
---------------------------------------------------------------------
1. Cold-Start Reality: In early-stage circular platforms, there is no historical
   transaction or click-through dataset to train a supervised binary or regression
   classifier (e.g., predicting p(accept_interest)).
2. Explainability: Textual attribute similarity produces transparent, verifiable
   rankings without black-box weight obscurity.
3. Zero Model Drift: Does not require continuous parameter retraining or label feedback.

Data Flow & Preprocessing:
--------------------------
1. Inputs:
   - A list of active listings (each with title, material_category, material_type,
     condition, city, quantity, description).
   - Recipient profile (preferred_categories, city, keywords/interests).
2. Preprocessing:
   - Construct composite text document for each listing.
   - Construct composite query document for recipient profile.
   - Lowercase, strip punctuation, filter English stop words.
3. Algorithm:
   - Compute TF-IDF matrix across all candidate documents + recipient query document.
   - Calculate Cosine Similarity between recipient vector and each listing vector.
   - Apply location boost (+15% if exact city match).
   - Normalize final score to a 0-100 range.
4. Output:
   - Sorted list of listings with similarity score (0-100) and human-readable explanation.
"""

import re
from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def sanitize_text(text: str) -> str:
    """Strip special characters and normalize whitespace."""
    if not text:
        return ""
    text = re.sub(r"[^\w\s]", " ", str(text))
    return " ".join(text.lower().split())


def build_listing_document(listing: Dict[str, Any]) -> str:
    """
    Construct a dense textual representation of a listing.
    Weight key features like category and material_type by repeating them.
    """
    title = sanitize_text(listing.get("title", ""))
    cat = sanitize_text(listing.get("material_category", ""))
    mtype = sanitize_text(listing.get("material_type", ""))
    condition = sanitize_text(listing.get("condition", ""))
    city = sanitize_text(listing.get("city", ""))
    desc = sanitize_text(listing.get("description", ""))
    qty = sanitize_text(listing.get("quantity_description", ""))

    # Feature engineering: give extra prominence to category and type
    parts = [
        title,
        cat, cat,  # Repeated for weight
        mtype, mtype,
        condition,
        city,
        qty,
        desc
    ]
    return " ".join(filter(None, parts))


def build_recipient_document(recipient_profile: Dict[str, Any]) -> str:
    """
    Construct a query document from recipient preferences.
    """
    categories = recipient_profile.get("preferred_categories", [])
    if isinstance(categories, list):
        categories_str = " ".join([sanitize_text(c) for c in categories])
    else:
        categories_str = sanitize_text(categories)

    city = sanitize_text(recipient_profile.get("city", ""))
    keywords = sanitize_text(recipient_profile.get("keywords", ""))

    # Repeat categories to emphasize material discipline
    parts = [categories_str, categories_str, city, keywords]
    return " ".join(filter(None, parts))


def generate_explanation(
    listing: Dict[str, Any],
    recipient_profile: Dict[str, Any],
    score: float,
    city_match: bool,
    cat_match: bool
) -> str:
    """
    Produce a deterministic, human-readable reason string.
    """
    reasons = []
    preferred = recipient_profile.get("preferred_categories", [])
    if not isinstance(preferred, list):
        preferred = [preferred]
    preferred_clean = [str(c).lower() for c in preferred]

    listing_cat = str(listing.get("material_category", "")).lower()
    listing_city = str(listing.get("city", "")).title()

    if cat_match:
        reasons.append(f"matches your interest in '{listing_cat}'")
    if city_match:
        reasons.append(f"is located nearby in {listing_city}")
    if not reasons:
        reasons.append("has high textual keyword relevance to your profile")

    return f"Recommended (Score: {score:.0f}/100) because it " + " and ".join(reasons) + "."


def rank_listings(
    listings: List[Dict[str, Any]],
    recipient_profile: Dict[str, Any],
    top_n: int = 10
) -> List[Dict[str, Any]]:
    """
    Rank material listings against a recipient preference profile using TF-IDF + Cosine Similarity.

    Parameters:
    -----------
    listings : List[Dict]
        List of candidate listing dictionaries.
    recipient_profile : Dict
        Recipient user profile containing 'preferred_categories', 'city', and optional 'keywords'.
    top_n : int
        Maximum number of recommended listings to return.

    Returns:
    --------
    List[Dict]
        List of ranked listings with added 'score' and 'reason' fields.
    """
    if not listings:
        return []

    # 1. Build documents
    listing_docs = [build_listing_document(l) for l in listings]
    recipient_doc = build_recipient_document(recipient_profile)

    # Fallback to general representation if recipient document is completely blank
    if not recipient_doc.strip():
        recipient_doc = "reusable materials surplus waste"

    corpus = listing_docs + [recipient_doc]

    # 2. Vectorization
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=2500,
        sublinear_tf=True
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
    except ValueError:
        # Fallback if empty vocabulary (e.g., only single-character stop words)
        return listings[:top_n]

    # Split into listings vectors and recipient query vector
    listing_vectors = tfidf_matrix[:-1]
    recipient_vector = tfidf_matrix[-1:]

    # 3. Compute Cosine Similarity
    similarities = cosine_similarity(listing_vectors, recipient_vector).flatten()

    recipient_city = str(recipient_profile.get("city", "")).strip().lower()
    recipient_categories = [
        str(c).strip().lower()
        for c in recipient_profile.get("preferred_categories", [])
    ]

    scored_listings = []
    for idx, listing in enumerate(listings):
        base_sim = float(similarities[idx])  # 0.0 to 1.0

        # Location and category verification
        listing_city = str(listing.get("city", "")).strip().lower()
        listing_cat = str(listing.get("material_category", "")).strip().lower()

        city_match = bool(recipient_city and listing_city and recipient_city == listing_city)
        cat_match = bool(listing_cat and listing_cat in recipient_categories)

        # Calculate composite score on 100-point scale:
        # Cosine similarity accounts for 50%, Category match 30%, City match 20%
        score = (base_sim * 50.0) + (30.0 if cat_match else 0.0) + (20.0 if city_match else 0.0)
        score = min(100.0, max(0.0, round(score, 1)))

        reason = generate_explanation(
            listing=listing,
            recipient_profile=recipient_profile,
            score=score,
            city_match=city_match,
            cat_match=cat_match
        )

        listing_copy = dict(listing)
        listing_copy["score"] = score
        listing_copy["reason"] = reason
        listing_copy["cosine_similarity"] = round(base_sim, 4)
        scored_listings.append(listing_copy)

    # 4. Sort descending by score
    scored_listings.sort(key=lambda x: x["score"], reverse=True)
    return scored_listings[:top_n]


if __name__ == "__main__":
    # Self-test demonstration
    sample_listings = [
        {
            "id": "1",
            "title": "Clean Heavy Duty Cardboard Shipping Boxes",
            "material_category": "cardboard",
            "material_type": "Corrugated Boxes",
            "condition": "Good",
            "city": "Bengaluru",
            "description": "50 flattened clean cardboard boxes from warehouse, ready for crafts or moving."
        },
        {
            "id": "2",
            "title": "Clear Glass Mason Jars with Lids",
            "material_category": "glass",
            "material_type": "Jars",
            "condition": "Like New",
            "city": "Mumbai",
            "description": "30 sanitized jam jars, great for candles or food storage."
        },
        {
            "id": "3",
            "title": "Hardwood Timber Pallet Offcuts",
            "material_category": "wood",
            "material_type": "Pallets",
            "condition": "Fair",
            "city": "Bengaluru",
            "description": "Solid pine and oak offcuts suitable for carpentry students and small woodcrafts."
        }
    ]

    sample_recipient = {
        "city": "Bengaluru",
        "preferred_categories": ["cardboard", "wood"],
        "keywords": "crafts workshop"
    }

    results = rank_listings(sample_listings, sample_recipient)
    print("\n--- Content-Based Recommendation Self-Test ---")
    for r in results:
        print(f"[{r['score']}/100] {r['title']} in {r['city']}")
        print(f"   Reason: {r['reason']}\n")
