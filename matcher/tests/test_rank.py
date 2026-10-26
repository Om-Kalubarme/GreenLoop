import sys
import os
import unittest

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from rank import rank_listings, sanitize_text, build_listing_document


class TestRecommendationMatcher(unittest.TestCase):
    def test_sanitize_text(self):
        raw = "Cardboard Boxes!! (Clean & Flattened)..."
        cleaned = sanitize_text(raw)
        self.assertIn("cardboard", cleaned)
        self.assertIn("boxes", cleaned)
        self.assertNotIn("!", cleaned)

    def test_build_listing_document(self):
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
        self.assertIn("industrial", doc)
        self.assertIn("wood", doc)
        self.assertIn("bengaluru", doc)

    def test_rank_listings_prioritizes_matching_category_and_city(self):
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
        self.assertEqual(len(results), 2)
        # Cardboard in Bengaluru should rank higher than plastic in Mumbai
        self.assertEqual(results[0]["id"], "2")
        self.assertGreater(results[0]["score"], results[1]["score"])
        self.assertIn("matches your interest in 'cardboard'", results[0]["reason"])
        self.assertIn("is located nearby in Bengaluru", results[0]["reason"])

    def test_rank_listings_handles_empty_listings(self):
        results = rank_listings([], {"city": "Delhi"})
        self.assertEqual(results, [])


if __name__ == '__main__':
    unittest.main()
