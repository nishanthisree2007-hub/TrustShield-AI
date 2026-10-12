from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, HttpUrl, ConfigDict

class BrandBase(BaseModel):
    name: str
    alt_names: List[str] = []
    official_website: str
    approved_handles: List[str] = []
    logo_hash: Optional[str] = None
    logo_url: Optional[str] = None
    support_channels: List[str] = []
    known_keywords: List[str] = []
    description: Optional[str] = None

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    alt_names: Optional[List[str]] = None
    official_website: Optional[str] = None
    approved_handles: Optional[List[str]] = None
    logo_hash: Optional[str] = None
    logo_url: Optional[str] = None
    support_channels: Optional[List[str]] = None
    known_keywords: Optional[List[str]] = None
    description: Optional[str] = None

class BrandResponse(BrandBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime

class BrandSimilarityAnalysis(BaseModel):
    brand_id: int
    brand_name: str
    name_similarity_score: float
    username_similarity_score: float
    domain_similarity_score: float
    logo_similarity_score: Optional[float] = None
    overall_similarity_score: float
    evidence_breakdown: List[str]
    is_impersonation_candidate: bool
    risk_level: str
