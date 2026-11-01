"""
GreenLoop — Robust Dual-Engine Waste & Material Classifier
============================================================
Combines foundational vision feature recognition (ImageNet-1K ResNet50)
with specialized domain waste stream classification (MobileNetV3) to
provide accurate, reliable 4-class waste stream classification:

  1. Hazardous
  2. Non-Recyclable
  3. Organic
  4. Recyclable

Prevents misclassification of everyday consumer goods (e.g. notebooks,
books, stationery, office supplies, packaging, food, ceramics, electronics).
"""

import os
import io
import json
import base64
from typing import Dict, Any, Union
from PIL import Image, ImageFile
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models

ImageFile.LOAD_TRUNCATED_IMAGES = True

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
WEIGHTS_PATH = os.path.join(MODELS_DIR, "waste_classifier_mobilenetv3.pth")
METADATA_PATH = os.path.join(MODELS_DIR, "waste_classes.json")

DEFAULT_CLASSES = ["Hazardous", "Non-Recyclable", "Organic", "Recyclable"]

DEFAULT_METADATA = {
    "Hazardous": {
        "badge_color": "#D9381E",
        "bg_color": "#FCEBE6",
        "icon": "⚠️",
        "recyclable": False,
        "hazard_level": "High",
        "description": "Hazardous materials including batteries, e-waste, toxic solvents, paints, and chemicals requiring specialized disposal.",
        "handling_instructions": "Do NOT place in municipal landfills or general recycling. Hand over to certified e-waste or hazmat collection centers.",
        "suggested_actions": ["Hazmat Disposal Facility", "E-Waste Safe Recycler", "Certified Battery Drop-off"]
    },
    "Non-Recyclable": {
        "badge_color": "#7F8C8D",
        "bg_color": "#F2F3F4",
        "icon": "🗑️",
        "recyclable": False,
        "hazard_level": "Low",
        "description": "Contaminated ceramics, styrofoam (EPS), sanitary products, or multi-laminate plastics that cannot be remanufactured.",
        "handling_instructions": "Sort into non-recyclable solid waste streams. Where possible, seek mechanical downcycling or clean energy recovery.",
        "suggested_actions": ["Solid Waste Diversion", "Refuse-Derived Fuel", "Sanitary Landfill Management"]
    },
    "Organic": {
        "badge_color": "#27AE60",
        "bg_color": "#E8F8F5",
        "icon": "🌱",
        "recyclable": True,
        "hazard_level": "None",
        "description": "Biodegradable organic biomass, food offcuts, egg shells, yard waste, and compostable organic matter.",
        "handling_instructions": "Ideal for aerobic composting, vermicomposting, or community anaerobic biodigesters to produce nutrient-rich bio-fertilizer.",
        "suggested_actions": ["Community Composting", "Biogas Generation", "Soil Conditioning"]
    },
    "Recyclable": {
        "badge_color": "#0A5C36",
        "bg_color": "#E1F2E8",
        "icon": "♻️",
        "recyclable": True,
        "hazard_level": "None",
        "description": "High-purity secondary commodities: clean cardboard, notebooks, paper packaging, glass containers, metal cans, and rigid plastics.",
        "handling_instructions": "Keep clean and dry, compact if possible, and list on GreenLoop Marketplace for remanufacturers, upcyclers, and artisans.",
        "suggested_actions": ["GreenLoop Marketplace Listing", "Materials Recovery Facility (MRF)", "Industrial Upcycling"]
    }
}

# Strict paper & stationery object classes (guaranteed Recyclable)
STATIONERY_PAPER_CLASSES = {
    'binder', 'notebook', 'book jacket', 'comic book', 'envelope', 'paper towel',
    'menu', 'pencil box', 'pencil sharpener', 'quill'
}

# Clean recyclable commodity containers
RECYCLABLE_CONTAINERS = {
    'pop bottle', 'beer bottle', 'water bottle', 'wine bottle', 'pill bottle',
    'tin can', 'can opener', 'crate', 'barrel', 'tub', 'water jug',
    'pitcher', 'beaker', 'flask'
}

# Electronics and hazmat appliances
ELECTRONICS_HAZMAT_CLASSES = {
    'cellular telephone', 'laptop', 'desktop computer', 'computer keyboard', 'mouse',
    'hard disc', 'monitor', 'screen', 'modem', 'printer', 'tape player',
    'loudspeaker', 'power drill', 'joystick', 'radio', 'cassette', 'vacuum',
    'sewing machine', 'microphone', 'remote control', 'projector', 'iron',
    'hair dryer', 'electric fan', 'space heater', 'torch', 'lighter'
}

# Organic food and biomass classes
ORGANIC_BIOMASS_CLASSES = {
    'banana', 'orange', 'apple', 'lemon', 'fig', 'pineapple', 'strawberry',
    'pomegranate', 'corn', 'head cabbage', 'broccoli', 'cauliflower', 'zucchini',
    'spaghetti squash', 'bell pepper', 'mushroom', 'pizza', 'bagel', 'cheeseburger',
    'hotdog', 'pretzel', 'burrito', 'bakery', 'acorn', 'cucumber', 'artichoke',
    'cardoon', 'hay', 'meat loaf', 'trifle', 'custard apple', 'guacamole',
    'mashed potato', 'potpie', 'ice cream', 'carbonara', 'espresso'
}

# Non-recyclable ceramics and inerts
NON_RECYCLABLE_CLASSES = {
    'diaper', 'pottery', 'teapot', 'saucer', 'potter\'s wheel', 'vase',
    'urn', 'ashcan', 'toilet tissue', 'band aid'
}


class WasteClassifier:
    """Robust Dual-Engine Waste Classifier."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WasteClassifier, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.device = torch.device("mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu"))
        self.classes = DEFAULT_CLASSES
        self.metadata = DEFAULT_METADATA

        # Foundational ResNet50 vision model
        self.foundation_model = None
        self.foundation_categories = None
        self.foundation_transform = None

        # Domain-trained MobileNetV3 waste model
        self.domain_model = None
        self.domain_transform = None

        self.load_models()
        self._initialized = True

    def load_models(self):
        """Loads both foundational and domain models."""
        try:
            # 1. Load Foundational Vision Model
            resnet_weights = models.ResNet50_Weights.DEFAULT
            self.foundation_model = models.resnet50(weights=resnet_weights).to(self.device).eval()
            self.foundation_categories = resnet_weights.meta['categories']
            self.foundation_transform = resnet_weights.transforms()
            print("[WasteClassifier] Foundational Vision Engine (ResNet50 ImageNet-1K) ready.")
        except Exception as e:
            print(f"[WasteClassifier] Warning: Could not initialize foundation model: {e}")

        try:
            # 2. Load Domain Waste Model (MobileNetV3)
            weights = models.MobileNet_V3_Large_Weights.DEFAULT
            domain_model = models.mobilenet_v3_large(weights=weights)
            in_features = domain_model.classifier[0].in_features
            domain_model.classifier = nn.Sequential(
                nn.Linear(in_features, 256),
                nn.Hardswish(),
                nn.Dropout(p=0.35),
                nn.Linear(256, len(self.classes))
            )

            if os.path.exists(WEIGHTS_PATH):
                state_dict = torch.load(WEIGHTS_PATH, map_location=self.device)
                domain_model.load_state_dict(state_dict)
                print(f"[WasteClassifier] Domain Waste Engine (MobileNetV3) loaded from: {WEIGHTS_PATH}")

            self.domain_model = domain_model.to(self.device).eval()
            self.domain_transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
        except Exception as e:
            print(f"[WasteClassifier] Error initializing domain model: {e}")

    def predict(self, image_input: Union[str, bytes, Image.Image]) -> Dict[str, Any]:
        """
        Classifies an input image with dual-engine hybrid verification.
        """
        if self.foundation_model is None or self.domain_model is None:
            self.load_models()

        # Parse image
        img = None
        if isinstance(image_input, Image.Image):
            img = image_input
        elif isinstance(image_input, bytes):
            img = Image.open(io.BytesIO(image_input))
        elif isinstance(image_input, str):
            if image_input.startswith("data:image"):
                header, encoded = image_input.split(",", 1)
                img_data = base64.b64decode(encoded)
                img = Image.open(io.BytesIO(img_data))
            elif os.path.exists(image_input):
                img = Image.open(image_input)
            else:
                raise ValueError("Image string must be an existing file path or a base64 data URI")
        else:
            raise TypeError("Unsupported image input format")

        if img.mode != "RGB":
            img = img.convert("RGB")

        # -------------------------------------------------------------
        # 1. Run Foundational Object Recognition (ResNet50)
        # -------------------------------------------------------------
        top_object_names = []
        top_object_scores = []
        if self.foundation_model is not None:
            f_tensor = self.foundation_transform(img).unsqueeze(0).to(self.device)
            with torch.no_grad():
                f_logits = self.foundation_model(f_tensor)
                f_probs = torch.softmax(f_logits, dim=1).squeeze(0)

            top10 = torch.topk(f_probs, 10)
            top_object_names = [self.foundation_categories[i] for i in top10.indices.tolist()]
            top_object_scores = [s.item() for s in top10.values]

        # -------------------------------------------------------------
        # 2. Run Domain Waste Stream Model (MobileNetV3)
        # -------------------------------------------------------------
        domain_probs = [0.25, 0.25, 0.25, 0.25]
        if self.domain_model is not None:
            d_tensor = self.domain_transform(img).unsqueeze(0).to(self.device)
            with torch.no_grad():
                d_logits = self.domain_model(d_tensor)
                domain_probs = torch.softmax(d_logits, dim=1).squeeze(0).cpu().numpy().tolist()

        # Initial probabilities dictionary: {Hazardous, Non-Recyclable, Organic, Recyclable}
        probs_dict = {
            'Hazardous': float(domain_probs[0]),
            'Non-Recyclable': float(domain_probs[1]),
            'Organic': float(domain_probs[2]),
            'Recyclable': float(domain_probs[3])
        }

        # -------------------------------------------------------------
        # 3. Intelligent Semantic Fusion & Guardrails
        # -------------------------------------------------------------
        top3_objects = top_object_names[:3] if top_object_names else []
        top_object_str = top3_objects[0] if top3_objects else "general object"

        is_paper_stationery = any(obj in STATIONERY_PAPER_CLASSES for obj in top3_objects)
        is_recyclable_container = any(obj in RECYCLABLE_CONTAINERS for obj in top3_objects)
        is_electronics_hazmat = any(obj in ELECTRONICS_HAZMAT_CLASSES for obj in top3_objects)
        is_organic_food = any(obj in ORGANIC_BIOMASS_CLASSES for obj in top3_objects)
        is_non_recyclable = any(obj in NON_RECYCLABLE_CLASSES for obj in top3_objects)

        detected_label = None

        # A) NOTEBOOKS, PAPER, BINDERS, BOOKS, STATIONERY -> DECISIVELY RECYCLABLE
        if is_paper_stationery:
            detected_label = f"Paper / Stationery Product ({top_object_str})"
            probs_dict["Recyclable"] = max(0.92, probs_dict["Recyclable"] + 0.60)
            probs_dict["Hazardous"] = min(0.02, probs_dict["Hazardous"] * 0.05)
            probs_dict["Non-Recyclable"] = min(0.05, probs_dict["Non-Recyclable"] * 0.1)
            probs_dict["Organic"] = min(0.01, probs_dict["Organic"] * 0.05)

        # B) BOTTLES, CANS, METAL PACKAGING -> RECYCLABLE (unless domain model strongly detects styrofoam)
        elif is_recyclable_container and probs_dict["Non-Recyclable"] < 0.45:
            detected_label = f"Recyclable Container / Commodity ({top_object_str})"
            probs_dict["Recyclable"] = max(0.90, probs_dict["Recyclable"] + 0.50)
            probs_dict["Hazardous"] = min(0.03, probs_dict["Hazardous"] * 0.05)
            probs_dict["Non-Recyclable"] = min(0.05, probs_dict["Non-Recyclable"] * 0.1)
            probs_dict["Organic"] = min(0.02, probs_dict["Organic"] * 0.05)

        # C) CONSUMER ELECTRONICS, BATTERIES, APPLIANCES -> HAZARDOUS
        elif is_electronics_hazmat:
            detected_label = f"Electronic Appliance / Hazmat Component ({top_object_str})"
            probs_dict["Hazardous"] = max(0.92, probs_dict["Hazardous"] + 0.50)
            probs_dict["Recyclable"] = min(0.05, probs_dict["Recyclable"] * 0.1)
            probs_dict["Non-Recyclable"] = min(0.02, probs_dict["Non-Recyclable"] * 0.1)
            probs_dict["Organic"] = min(0.01, probs_dict["Organic"] * 0.05)

        # D) FOOD, FRUITS, VEGETABLES, PLANT BIOMASS -> ORGANIC
        elif is_organic_food:
            detected_label = f"Organic Food Scrap / Biodegradable Biomass ({top_object_str})"
            probs_dict["Organic"] = max(0.90, probs_dict["Organic"] + 0.50)
            probs_dict["Hazardous"] = min(0.01, probs_dict["Hazardous"] * 0.05)
            probs_dict["Non-Recyclable"] = min(0.05, probs_dict["Non-Recyclable"] * 0.1)
            probs_dict["Recyclable"] = min(0.04, probs_dict["Recyclable"] * 0.1)

        # E) CERAMICS, SANITARY PRODUCTS, INERTS -> NON-RECYCLABLE
        elif is_non_recyclable:
            detected_label = f"Ceramics / Inert Solid Waste ({top_object_str})"
            probs_dict["Non-Recyclable"] = max(0.85, probs_dict["Non-Recyclable"] + 0.45)
            probs_dict["Recyclable"] = min(0.08, probs_dict["Recyclable"] * 0.15)
            probs_dict["Hazardous"] = min(0.04, probs_dict["Hazardous"] * 0.1)
            probs_dict["Organic"] = min(0.03, probs_dict["Organic"] * 0.1)

        # -------------------------------------------------------------
        # 4. Normalize Probabilities
        # -------------------------------------------------------------
        total_p = sum(probs_dict.values())
        normalized_probs = {k: round(v / total_p, 4) for k, v in probs_dict.items()}

        best_category = max(normalized_probs, key=normalized_probs.get)
        confidence = float(normalized_probs[best_category])
        meta = self.metadata.get(best_category, {})

        return {
            "category": best_category,
            "confidence": round(confidence * 100, 1),
            "confidence_ratio": confidence,
            "probabilities": normalized_probs,
            "detected_item": detected_label or top_object_str,
            "badge_color": meta.get("badge_color", "#0A5C36"),
            "bg_color": meta.get("bg_color", "#E1F2E8"),
            "icon": meta.get("icon", "📦"),
            "recyclable": meta.get("recyclable", True),
            "hazard_level": meta.get("hazard_level", "None"),
            "description": meta.get("description", ""),
            "handling_instructions": meta.get("handling_instructions", ""),
            "suggested_actions": meta.get("suggested_actions", [])
        }


# Global singleton instance
classifier_service = WasteClassifier()
