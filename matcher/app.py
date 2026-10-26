"""
ReSource AI — Python Recommendation Microservice (FastAPI)
===========================================================
Exposes a lightweight REST microservice on port 8000 for
content-based recommendation ranking using scikit-learn.
"""

from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import uvicorn
from rank import rank_listings

app = FastAPI(
    title="ReSource AI Matcher Microservice",
    description="Content-Based Recommendation Engine using TF-IDF & Cosine Similarity",
    version="1.0.0"
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
        "service": "resource-ai-matcher",
        "engine": "scikit-learn TF-IDF + Cosine Similarity",
        "version": "1.0.0"
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


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
