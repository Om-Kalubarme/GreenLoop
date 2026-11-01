"""
GreenLoop — Python AI & Machine Learning Microservice (FastAPI)
================================================================
Exposes a lightweight REST microservice on port 8000 for:
  1. Content-based recommendation ranking (TF-IDF + Cosine Similarity)
  2. 4-Class Deep Learning Waste & Material Classification (MobileNetV3)
"""

import os
import sys
import json
from typing import List, Dict, Any, Optional

# Ensure matcher directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
from rank import rank_listings
from classifier_service import classifier_service

app = FastAPI(
    title="GreenLoop Intelligence Microservice",
    description="Recommendation Engine & MobileNetV3 4-Class Waste Classifier",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecipientProfile(BaseModel):
    city: Optional[str] = ""
    preferred_categories: List[str] = Field(default_factory=list)
    keywords: Optional[str] = ""


class RankRequest(BaseModel):
    listings: List[Dict[str, Any]]
    recipient_profile: RecipientProfile
    top_n: Optional[int] = 10


@app.get("/health")
def health_check():
    """Health check probe for Node.js backend integration."""
    return {
        "status": "ok",
        "service": "greenloop-intelligence",
        "engine": "MobileNetV3 + TF-IDF",
        "classes": classifier_service.classes,
        "device": str(classifier_service.device),
        "version": "2.0.0"
    }


@app.post("/rank")
def rank_endpoint(request: RankRequest):
    """
    Rank candidate listings against recipient preferences.
    """
    try:
        ranked = rank_listings(
            listings=request.listings,
            recipient_profile=request.recipient_profile.dict(),
            top_n=request.top_n
        )
        return {
            "success": True,
            "count": len(ranked),
            "recommendations": ranked
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify")
async def classify_endpoint(request: Request):
    """
    Classify a waste or surplus product into 4 classes:
      - Hazardous
      - Non-Recyclable
      - Organic
      - Recyclable
    Supports multipart/form-data file uploads and application/json (base64 or path/url).
    """
    content_type = request.headers.get("content-type", "")

    try:
        # 1. Handle multipart/form-data
        if "multipart/form-data" in content_type:
            form = await request.form()
            file_field = form.get("file") or form.get("image")
            if file_field and hasattr(file_field, "read"):
                content = await file_field.read()
                result = classifier_service.predict(content)
                return {"success": True, "prediction": result}

        # 2. Handle JSON payload
        try:
            body = await request.json()
            image_val = body.get("image") or body.get("image_url") or body.get("image_base64")
            if image_val:
                result = classifier_service.predict(image_val)
                return {"success": True, "prediction": result}
        except Exception:
            pass

        raise HTTPException(
            status_code=400,
            detail="Must provide an image file (multipart) or a JSON payload containing 'image'."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")


@app.get("/classify/info")
def classifier_info():
    """Returns metadata, class descriptions, and performance metrics."""
    return {
        "success": True,
        "classes": classifier_service.classes,
        "metadata": classifier_service.metadata,
        "device": str(classifier_service.device)
    }


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
