import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.brand import Brand
from app.models.investigation import Investigation
from app.models.user import User
from app.schemas.profile import ProfileAnalysisRequest, ProfileAnalysisResponse
from app.services.impersonation_radar import analyze_profile_impersonation
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/profiles", tags=["Impersonation Radar"])

@router.post("/analyze", response_model=ProfileAnalysisResponse)
def analyze_profile(
    req: ProfileAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = None
    if req.brand_id:
        brand = db.query(Brand).filter(Brand.id == req.brand_id).first()
    elif req.target_brand_name:
        brand = db.query(Brand).filter(Brand.name.ilike(req.target_brand_name)).first()
    
    if not brand:
        # Fallback to first available brand or generic comparison
        brand = db.query(Brand).first()

    bname = brand.name if brand else (req.target_brand_name or "Target Brand")
    balts = json.loads(brand.alt_names or "[]") if brand else []
    bweb = brand.official_website if brand else "https://official.example.com"
    bhandles = json.loads(brand.approved_handles or "[]") if brand else []
    bkeywords = json.loads(brand.known_keywords or "[]") if brand else []
    blogo_hash = brand.logo_hash if brand else None

    result = analyze_profile_impersonation(
        username=req.username,
        display_name=req.display_name or req.username,
        profile_description=req.profile_description or "",
        profile_url=req.profile_url or "",
        brand_name=bname,
        brand_alt_names=balts,
        brand_website=bweb,
        approved_handles=bhandles,
        known_keywords=bkeywords,
        profile_image_data=req.profile_image_data,
        brand_logo_hash=blogo_hash
    )

    # Persist investigation if risk exceeds threshold or by default
    new_inv = Investigation(
        title=f"Profile Impersonation Check: @{req.username} mimicking {bname}",
        entity_type="profile",
        entity_identifier=req.username if req.username.startswith("@") else f"@{req.username}",
        brand_id=brand.id if brand else None,
        risk_score=result["risk_score"],
        risk_category=result["risk_category"],
        status="UNDER_REVIEW" if result["risk_score"] >= 60.0 else "OPEN",
        warning_signals=json.dumps(result["detected_warning_signals"]),
        contributing_factors=json.dumps(result["contributing_factors"]),
        evidence_summary=json.dumps({"url": req.profile_url, "display_name": req.display_name}),
        missing_data=json.dumps(result["missing_information"]),
        confidence_limitations=json.dumps(result["confidence_limitations"]),
        recommended_actions=json.dumps(result["recommended_actions"]),
        analyst_notes=f"Automated scan initiated via Impersonation Radar for brand '{bname}'."
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)

    result["investigation_id"] = new_inv.id
    return result
