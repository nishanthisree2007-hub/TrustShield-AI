from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class CopilotQueryRequest(BaseModel):
    investigation_id: Optional[int] = None
    context_data: Optional[Dict[str, Any]] = None
    query_type: str  # summarize, explain_risk, recommend_steps, draft_abuse_report, customer_warning, general
    prompt: Optional[str] = ""

class AbuseReportDraft(BaseModel):
    target_entity: str
    target_type: str  # Registrar, Hosting Provider, Social Media Platform, App Store
    subject_line: str
    report_body: str
    evidence_attachments: List[str]
    legal_basis: str
    requires_human_approval: bool = True

class CustomerWarningDraft(BaseModel):
    title: str
    urgency_tier: str  # ADVISORY, WARNING, CRITICAL_ALERT
    short_advisory: str
    detailed_guidelines: List[str]
    channel_recommendations: List[str]  # e.g., Twitter, In-app notice, Email
    requires_human_approval: bool = True

class CopilotQueryResponse(BaseModel):
    query_type: str
    summary: str
    detailed_explanation: str
    key_risk_drivers: List[str]
    identified_missing_evidence: List[str]
    recommended_next_steps: List[str]
    abuse_report: Optional[AbuseReportDraft] = None
    customer_warning: Optional[CustomerWarningDraft] = None
    is_rule_based_fallback: bool
    requires_human_approval_banner: str = "CONFIRMATION REQUIRED: Human analyst verification is mandatory prior to sending notices or executing external actions."
