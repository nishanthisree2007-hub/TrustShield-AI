from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class MobileAppInspectionRequest(BaseModel):
    app_name: str
    developer: str
    package_identifier: str  # e.g., com.secure.apexpay.login
    description: Optional[str] = ""
    website: Optional[str] = ""
    requested_permissions: List[str] = []
    brand_id: Optional[int] = None
    target_brand_name: Optional[str] = None

class PermissionRiskIndicator(BaseModel):
    permission: str
    risk_level: str  # HIGH, DANGEROUS, NORMAL
    description: str
    is_suspicious_for_app_type: bool

class MobileAppInspectionResponse(BaseModel):
    risk_score: float
    risk_category: str
    brand_impersonation_candidate: bool
    developer_reputation_flags: List[str]
    package_identifier_findings: List[str]
    dangerous_permissions_detected: List[PermissionRiskIndicator]
    description_anomalies: List[str]
    missing_verification_info: List[str]
    contributing_factors: Dict[str, float]
    disclaimer: str
    recommended_actions: List[str]
    investigation_id: Optional[int] = None
