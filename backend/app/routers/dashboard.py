import json
from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.investigation import Investigation
from app.models.brand import Brand
from app.models.user import User
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    invs = db.query(Investigation).all()

    total_investigations = len(invs)
    impersonation_attempts = sum(1 for i in invs if i.entity_type == "profile")
    high_risk_findings = sum(1 for i in invs if i.risk_category in ("HIGH", "CRITICAL"))
    scam_messages_count = sum(1 for i in invs if i.entity_type == "scam_message")
    suspicious_apps_count = sum(1 for i in invs if i.entity_type == "mobile_app")
    open_count = sum(1 for i in invs if i.status in ("OPEN", "UNDER_REVIEW"))
    resolved_count = sum(1 for i in invs if i.status == "RESOLVED")
    false_positives_count = sum(1 for i in invs if i.is_false_positive or i.status == "FALSE_POSITIVE")

    # Risk distribution
    critical_c = sum(1 for i in invs if i.risk_category == "CRITICAL")
    high_c = sum(1 for i in invs if i.risk_category == "HIGH")
    medium_c = sum(1 for i in invs if i.risk_category == "MEDIUM")
    low_c = sum(1 for i in invs if i.risk_category == "LOW")

    risk_distribution = [
        {"name": "Critical Risk", "value": critical_c, "color": "#EF4444"},
        {"name": "High Risk", "value": high_c, "color": "#F97316"},
        {"name": "Medium Risk", "value": medium_c, "color": "#EAB308"},
        {"name": "Low Risk", "value": low_c, "color": "#22C55E"}
    ]

    # Entity types breakdown
    entity_types_data = [
        {"name": "Profiles", "count": impersonation_attempts},
        {"name": "Scam Text", "count": scam_messages_count},
        {"name": "Mobile Apps", "count": suspicious_apps_count},
        {"name": "Lookalike Domains", "count": sum(1 for i in invs if i.entity_type == "domain")}
    ]

    # Timeline of threat activity over the past 7 days
    timeline_days = {}
    today = datetime.utcnow().date()
    for d in range(6, -1, -1):
        day_str = (today - timedelta(days=d)).strftime("%b %d")
        timeline_days[day_str] = {"day": day_str, "threats": 0, "resolved": 0}

    for i in invs:
        day_key = i.created_at.strftime("%b %d")
        if day_key in timeline_days:
            timeline_days[day_key]["threats"] += 1
            if i.status == "RESOLVED":
                timeline_days[day_key]["resolved"] += 1

    threat_timeline = list(timeline_days.values())

    # Recent alerts (top 6 highest risk or newest)
    recent_alerts = []
    sorted_invs = sorted(invs, key=lambda x: (x.created_at), reverse=True)[:6]
    for i in sorted_invs:
        recent_alerts.append({
            "id": i.id,
            "title": i.title,
            "entity_identifier": i.entity_identifier,
            "entity_type": i.entity_type,
            "brand_name": i.brand.name if i.brand else "Unspecified",
            "risk_score": i.risk_score,
            "risk_category": i.risk_category,
            "status": i.status,
            "created_at": i.created_at.isoformat()
        })

    brands_monitored = db.query(Brand).count()

    return {
        "total_investigations": total_investigations,
        "impersonation_attempts": impersonation_attempts,
        "high_risk_findings": high_risk_findings,
        "scam_messages_count": scam_messages_count,
        "suspicious_apps_count": suspicious_apps_count,
        "open_investigations": open_count,
        "resolved_investigations": resolved_count,
        "false_positives_count": false_positives_count,
        "brands_monitored": brands_monitored,
        "potential_campaign_clusters": 2,
        "risk_distribution": risk_distribution,
        "entity_types_data": entity_types_data,
        "threat_timeline": threat_timeline,
        "recent_alerts": recent_alerts
    }
