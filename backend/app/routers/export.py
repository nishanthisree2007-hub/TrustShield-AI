import io
import csv
import json
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.investigation import Investigation
from app.models.user import User
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/export", tags=["Data Export"])

@router.get("/investigations/json")
def export_investigations_json(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invs = db.query(Investigation).all()
    data = []
    for i in invs:
        data.append({
            "id": i.id,
            "title": i.title,
            "entity_type": i.entity_type,
            "entity_identifier": i.entity_identifier,
            "brand": i.brand.name if i.brand else None,
            "risk_score": i.risk_score,
            "risk_category": i.risk_category,
            "status": i.status,
            "warning_signals": json.loads(i.warning_signals or "[]"),
            "analyst_notes": i.analyst_notes,
            "created_at": i.created_at.isoformat(),
            "resolved_at": i.resolved_at.isoformat() if i.resolved_at else None
        })

    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=trustshield_investigations.json"}
    )

@router.get("/investigations/csv")
def export_investigations_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invs = db.query(Investigation).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Entity Type", "Target Identifier", "Brand", "Risk Score", "Risk Category", "Status", "Notes", "Created At"])

    for i in invs:
        writer.writerow([
            i.id,
            i.title,
            i.entity_type,
            i.entity_identifier,
            i.brand.name if i.brand else "N/A",
            i.risk_score,
            i.risk_category,
            i.status,
            (i.analyst_notes or "").replace("\n", " "),
            i.created_at.isoformat()
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=trustshield_investigations.csv"}
    )
