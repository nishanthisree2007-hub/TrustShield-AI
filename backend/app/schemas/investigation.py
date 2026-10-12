from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.brand import BrandResponse

class InvestigationBase(BaseModel):
    title: str
    entity_type: str  # profile, scam_message, mobile_app, domain
    entity_identifier: str
    brand_id: Optional[int] = None
    risk_score: float = 0.0
    risk_category: str = "LOW"
    status: str = "OPEN"
    warning_signals: List[str] = []
    contributing_factors: Dict[str, float] = {}
    evidence_summary: Dict[str, Any] = {}
    missing_data: List[str] = []
    confidence_limitations: List[str] = []
    recommended_actions: List[str] = []
    analyst_notes: Optional[str] = ""
    is_false_positive: bool = False

class InvestigationCreate(InvestigationBase):
    pass

class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None  # OPEN, UNDER_REVIEW, RESOLVED, FALSE_POSITIVE
    analyst_notes: Optional[str] = None
    is_false_positive: Optional[bool] = None

class InvestigationResponse(InvestigationBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    brand: Optional[BrandResponse] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class InvestigationFilter(BaseModel):
    brand_id: Optional[int] = None
    entity_type: Optional[str] = None
    risk_category: Optional[str] = None
    status: Optional[str] = None
    search: Optional[str] = None
