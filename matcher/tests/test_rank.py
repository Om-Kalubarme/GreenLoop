import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from rank import rank_listings, sanitize_text, build_listing_document


def test_sanitize_text():
    raw = "Cardboard Boxes!! (Clean & Flattened)..."
    cleaned = sanitize_text(raw)
    assert "cardboard" in cleaned
    assert "boxes" in cleaned
    assert "!" not in cleaned


def test_build_listing_document():
    listing = {
        "title": "Industrial Wooden Pallets",
        "material_category": "wood",
        "material_type": "Pallets",
        "condition": "Good",
        "city": "Bengaluru",
        "quantity_description": "10 pallets",
        "description": "Standard size untreated wooden pallets"
    }
    doc = build_listing_document(listing)
    assert "industrial" in doc
    assert "wood" in doc
    assert "bengaluru" in doc


def test_rank_listings_prioritizes_matching_category_and_city():
    listings = [
        {
            "id": "1",
            "title": "Bubble Wrap and Foam Packaging",
            "material_category": "plastic",
            "material_type": "Foam",
            "condition": "Like New",
            "city": "Mumbai",
            "description": "Cushioning wraps from electronics delivery"
        },
        {
            "id": "2",
            "title": "Clean Cardboard Shipping Cartons",
            "material_category": "cardboard",
            "material_type": "Corrugated Boxes",
            "condition": "Good",
            "city": "Bengaluru",
            "description": "Flatted moving boxes"
        }
    ]

    recipient = {
        "city": "Bengaluru",
        "preferred_categories": ["cardboard"],
        "keywords": "boxes cartons"
    }

    results = rank_listings(listings, recipient)
    assert len(results) == 2
    # Cardboard in Bengaluru should rank higher than plastic in Mumbai
    assert results[0]["id"] == "2"
    assert results[0]["score"] > results[1]["score"]
    assert "matches your interest in 'cardboard'" in results[0]["reason"]
    assert "is located nearby in Bengaluru" in results[0]["reason"]


def test_rank_listings_handles_empty_listings():
    results = rank_listings([], {"city": "Delhi"})
    assert results == []
