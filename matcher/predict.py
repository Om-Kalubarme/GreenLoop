#!/usr/bin/env python3
"""
GreenLoop — Waste Classification CLI Tool
Usage:
  python3 matcher/predict.py <image_path_or_url>
"""

import sys
import json
from classifier_service import classifier_service

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image input provided. Usage: python3 matcher/predict.py <path_or_base64>"}))
        sys.exit(1)

    image_input = sys.argv[1]
    try:
        result = classifier_service.predict(image_input)
        print(json.dumps({"success": True, "prediction": result}, indent=2))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
