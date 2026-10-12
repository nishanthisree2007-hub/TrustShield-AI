from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ProfileAnalysisRequest(BaseModel):
    username: str
    display_name: Optional[str] = ""
    profile_description: Optional[str] = ""
    profile_url: Optional[str] = ""
    brand_id: Optional[int] = None
    target_brand_name: Optional[str] = None
    profile_image_data: Optional[str] = None  # Base64 or URL

class ProfileAnalysisResponse(BaseModel):
    risk_score: float  # 0 to 100
    risk_category: str  # LOW, MEDIUM, HIGH, CRITICAL
    brand_matched: Optional[str] = None
    similarity_score: float
    detected_warning_signals: List[str]
    evidence: List[Dict[str, Any]]
    missing_information: List[str]
    confidence_limitations: List[str]
    contributing_factors: Dict[str, float]
    recommended_actions: List[str]
    investigation_id: Optional[int] = None
