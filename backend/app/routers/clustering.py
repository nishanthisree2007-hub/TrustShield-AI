import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.investigation import Investigation
from app.models.user import User
from app.schemas.cluster import CampaignClusteringResponse
from app.services.clustering import cluster_scam_messages
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/clustering", tags=["Campaign Clustering"])

@router.get("", response_model=CampaignClusteringResponse)
def get_campaign_clusters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch all scam messages and profiles
    invs = db.query(Investigation).filter(
        Investigation.entity_type.in_(["scam_message", "profile"])
    ).all()

    messages_payload: List[Dict[str, Any]] = []
    for inv in invs:
        ev = json.loads(inv.evidence_summary or "{}")
        text = ev.get("message_text") or inv.title or ""
        messages_payload.append({
            "id": f"inv-{inv.id}",
            "text": text,
            "sender": inv.entity_identifier,
            "brand_name": inv.brand.name if inv.brand else "Unspecified",
            "url": ev.get("url") or ev.get("associated_url"),
            "created_at": inv.created_at.isoformat()
        })

    # Add realistic multi-channel campaign seed data if database has few records
    if len(messages_payload) < 6:
        messages_payload.extend([
            {
                "id": "CAMP-01",
                "text": "URGENT NOTICE: Your ApexPay wallet is frozen. Click here to verify your identity immediately: https://apexpay-auth.vip/login",
                "sender": "+18005550123",
                "brand_name": "ApexPay",
                "url": "https://apexpay-auth.vip/login",
                "created_at": "2026-10-12T10:15:00Z"
            },
            {
                "id": "CAMP-02",
                "text": "SECURITY ALERT: Unauthorized access detected. Click here to verify your identity immediately: https://apexpay-auth.vip/login",
                "sender": "+18005550199",
                "brand_name": "ApexPay",
                "url": "https://apexpay-auth.vip/login",
                "created_at": "2026-10-12T10:30:00Z"
            },
            {
                "id": "CAMP-03",
                "text": "FINAL NOTICE: Account locked within 24 hours. Click here to verify your identity immediately: https://apexpay-login.top",
                "sender": "support@fake-apex.com",
                "brand_name": "ApexPay",
                "url": "https://apexpay-login.top",
                "created_at": "2026-10-12T11:00:00Z"
            },
            {
                "id": "CAMP-04",
                "text": "வாழ்த்துகள்! நீங்கள் ரூபாய் 50,000 பரிசு வென்றீர்கள். உடனே உங்கள் பரிசை பெற கீழே உள்ள லிங்க் கிளிக் செய்து OTP பகிருங்கள்.",
                "sender": "+919444012345",
                "brand_name": "Kampus Digital",
                "url": "https://kampus-rewards.cfd",
                "created_at": "2026-10-12T09:00:00Z"
            },
            {
                "id": "CAMP-05",
                "text": "குலுக்கல் பரிசு வென்றீர்கள்! உங்கள் பரிசு பெற உடனே கீழே உள்ள லிங்க் கிளிக் செய்து OTP பகிருங்கள்.",
                "sender": "+919444098765",
                "brand_name": "Kampus Digital",
                "url": "https://kampus-rewards.cfd",
                "created_at": "2026-10-12T09:30:00Z"
            }
        ])

    return cluster_scam_messages(messages_payload)

@router.post("/run", response_model=CampaignClusteringResponse)
def run_custom_clustering(
    messages: List[Dict[str, Any]],
    current_user: User = Depends(get_current_user)
):
    return cluster_scam_messages(messages)
