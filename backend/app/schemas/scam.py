from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ScamAnalysisRequest(BaseModel):
    message_text: str
    sender_handle_or_number: Optional[str] = ""
    associated_url: Optional[str] = ""
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None

class HighlightedPhrase(BaseModel):
    phrase: str
    category: str
    severity: str  # HIGH, MEDIUM, CRITICAL
    start_char: int
    end_char: int
    language: str  # en, ta, mixed

class ScamAnalysisResponse(BaseModel):
    scam_category: str  # Fake Giveaway, Phishing, Urgent Payment, Fake Support, Password/OTP Theft, Job Scam, Account Suspension, Investment Scam, Benign
    risk_score: float  # 0 to 100
    risk_category: str  # LOW, MEDIUM, HIGH, CRITICAL
    detected_language: str
    highlighted_phrases: List[HighlightedPhrase]
    evidence_explanation: List[str]
    detected_tactics: List[str]
    urgency_level: str  # None, Low, Moderate, Severe
    protective_recommendations: List[str]
    llm_explanation: Optional[str] = None
    investigation_id: Optional[int] = None
