from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.graph import ThreatGraphResponse
from app.services.threat_graph import generate_threat_relationship_graph
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/graph", tags=["Threat Relationship Graph"])

@router.get("", response_model=ThreatGraphResponse)
def get_threat_graph(
    brand_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return generate_threat_relationship_graph(db, filter_brand_id=brand_id)
