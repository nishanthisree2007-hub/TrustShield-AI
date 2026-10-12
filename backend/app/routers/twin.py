import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.brand import Brand
from app.models.user import User
from app.schemas.twin import DigitalTwinRunRequest, DigitalTwinRunResponse
from app.services.digital_twin import generate_and_evaluate_synthetic_scenarios
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/twin", tags=["Brand Risk Digital Twin"])

@router.post("/simulate", response_model=DigitalTwinRunResponse)
def run_digital_twin_simulation(
    req: DigitalTwinRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = db.query(Brand).filter(Brand.id == req.brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Selected brand not found.")

    res = generate_and_evaluate_synthetic_scenarios(
        brand_id=brand.id,
        brand_name=brand.name,
        brand_alt_names=json.loads(brand.alt_names or "[]"),
        brand_website=brand.official_website,
        approved_handles=json.loads(brand.approved_handles or "[]"),
        known_keywords=json.loads(brand.known_keywords or "[]")
    )

    return res
