import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.investigation import Investigation
from app.models.brand import Brand
from app.models.user import User
from app.schemas.investigation import (
    InvestigationCreate, InvestigationUpdate, InvestigationResponse
)
from app.routers.brands import format_brand_response
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/investigations", tags=["Investigation Management"])

def format_investigation_response(inv: Investigation) -> dict:
    return {
        "id": inv.id,
        "title": inv.title,
        "entity_type": inv.entity_type,
        "entity_identifier": inv.entity_identifier,
        "brand_id": inv.brand_id,
        "risk_score": inv.risk_score,
        "risk_category": inv.risk_category,
        "status": inv.status,
        "warning_signals": json.loads(inv.warning_signals or "[]"),
        "contributing_factors": json.loads(inv.contributing_factors or "{}"),
        "evidence_summary": json.loads(inv.evidence_summary or "{}"),
        "missing_data": json.loads(inv.missing_data or "[]"),
        "confidence_limitations": json.loads(inv.confidence_limitations or "[]"),
        "recommended_actions": json.loads(inv.recommended_actions or "[]"),
        "analyst_notes": inv.analyst_notes or "",
        "is_false_positive": inv.is_false_positive,
        "brand": format_brand_response(inv.brand) if inv.brand else None,
        "resolved_at": inv.resolved_at,
        "created_at": inv.created_at,
        "updated_at": inv.updated_at
    }

@router.get("", response_model=List[InvestigationResponse])
def list_investigations(
    brand_id: Optional[int] = Query(None),
    entity_type: Optional[str] = Query(None),
    risk_category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Investigation).order_by(Investigation.created_at.desc())

    if brand_id is not None:
        query = query.filter(Investigation.brand_id == brand_id)
    if entity_type:
        query = query.filter(Investigation.entity_type == entity_type)
    if risk_category:
        query = query.filter(Investigation.risk_category == risk_category)
    if status:
        query = query.filter(Investigation.status == status)
    if search:
        s_term = f"%{search}%"
        query = query.filter(
            (Investigation.title.ilike(s_term)) |
            (Investigation.entity_identifier.ilike(s_term)) |
            (Investigation.analyst_notes.ilike(s_term))
        )

    records = query.all()
    return [format_investigation_response(r) for r in records]

@router.post("", response_model=InvestigationResponse)
def create_investigation(
    inv_in: InvestigationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_inv = Investigation(
        title=inv_in.title,
        entity_type=inv_in.entity_type,
        entity_identifier=inv_in.entity_identifier,
        brand_id=inv_in.brand_id,
        risk_score=inv_in.risk_score,
        risk_category=inv_in.risk_category,
        status=inv_in.status,
        warning_signals=json.dumps(inv_in.warning_signals),
        contributing_factors=json.dumps(inv_in.contributing_factors),
        evidence_summary=json.dumps(inv_in.evidence_summary),
        missing_data=json.dumps(inv_in.missing_data),
        confidence_limitations=json.dumps(inv_in.confidence_limitations),
        recommended_actions=json.dumps(inv_in.recommended_actions),
        analyst_notes=inv_in.analyst_notes or "",
        is_false_positive=inv_in.is_false_positive
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)
    return format_investigation_response(new_inv)

@router.get("/{inv_id}", response_model=InvestigationResponse)
def get_investigation(
    inv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")
    return format_investigation_response(inv)

@router.put("/{inv_id}", response_model=InvestigationResponse)
def update_investigation(
    inv_id: int,
    inv_in: InvestigationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    if inv_in.title is not None:
        inv.title = inv_in.title
    if inv_in.status is not None:
        inv.status = inv_in.status
        if inv_in.status == "RESOLVED":
            inv.resolved_at = datetime.utcnow()
    if inv_in.analyst_notes is not None:
        inv.analyst_notes = inv_in.analyst_notes
    if inv_in.is_false_positive is not None:
        inv.is_false_positive = inv_in.is_false_positive
        if inv_in.is_false_positive:
            inv.status = "FALSE_POSITIVE"

    db.commit()
    db.refresh(inv)
    return format_investigation_response(inv)

@router.post("/{inv_id}/resolve", response_model=InvestigationResponse)
def resolve_investigation(
    inv_id: int,
    notes: Optional[str] = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    inv.status = "RESOLVED"
    inv.resolved_at = datetime.utcnow()
    if notes:
        existing = inv.analyst_notes or ""
        inv.analyst_notes = f"{existing}\n[RESOLVED on {datetime.utcnow().isoformat()}]: {notes}".strip()

    db.commit()
    db.refresh(inv)
    return format_investigation_response(inv)

@router.post("/{inv_id}/false-positive", response_model=InvestigationResponse)
def mark_false_positive(
    inv_id: int,
    reason: Optional[str] = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    inv.status = "FALSE_POSITIVE"
    inv.is_false_positive = True
    inv.risk_score = 0.0
    inv.risk_category = "LOW"
    existing = inv.analyst_notes or ""
    inv.analyst_notes = f"{existing}\n[MARKED FALSE POSITIVE]: {reason or 'Verified legitimate entity'}".strip()

    db.commit()
    db.refresh(inv)
    return format_investigation_response(inv)

@router.delete("/{inv_id}")
def delete_investigation(
    inv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    db.delete(inv)
    db.commit()
    return {"status": "success", "message": f"Investigation #{inv_id} deleted"}
