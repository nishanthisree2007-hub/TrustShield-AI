import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.investigation import Investigation
from app.models.user import User
from app.schemas.copilot import CopilotQueryRequest, CopilotQueryResponse
from app.services.copilot import generate_copilot_response
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/copilot", tags=["AI Investigation Copilot"])

@router.post("/query", response_model=CopilotQueryResponse)
def query_copilot(
    req: CopilotQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv_data = {}
    if req.investigation_id:
        inv = db.query(Investigation).filter(Investigation.id == req.investigation_id).first()
        if not inv:
            raise HTTPException(status_code=404, detail="Investigation record not found")
        inv_data = {
            "id": inv.id,
            "title": inv.title,
            "entity_identifier": inv.entity_identifier,
            "entity_type": inv.entity_type,
            "risk_score": inv.risk_score,
            "risk_category": inv.risk_category,
            "warning_signals": json.loads(inv.warning_signals or "[]"),
            "evidence_summary": json.loads(inv.evidence_summary or "{}"),
            "brand_name": inv.brand.name if inv.brand else "Target Brand"
        }
    elif req.context_data:
        inv_data = req.context_data
    else:
        inv_data = {
            "title": "Ad-Hoc Threat Query",
            "entity_identifier": "Suspicious Entity",
            "entity_type": "profile",
            "risk_score": 75.0,
            "risk_category": "HIGH",
            "warning_signals": ["Unsolicited account targeting", "High brand lexical similarity"]
        }

    return generate_copilot_response(
        query_type=req.query_type,
        investigation_data=inv_data,
        custom_prompt=req.prompt
    )
