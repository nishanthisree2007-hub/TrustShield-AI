import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.brand import Brand
from app.models.investigation import Investigation
from app.models.user import User
from app.schemas.app_inspector import MobileAppInspectionRequest, MobileAppInspectionResponse
from app.services.mobile_inspector import analyze_mobile_app
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/apps", tags=["Mobile App Inspector"])

@router.post("/inspect", response_model=MobileAppInspectionResponse)
def inspect_mobile_app(
    req: MobileAppInspectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = None
    if req.brand_id:
        brand = db.query(Brand).filter(Brand.id == req.brand_id).first()
    elif req.target_brand_name:
        brand = db.query(Brand).filter(Brand.name.ilike(req.target_brand_name)).first()

    bname = brand.name if brand else req.target_brand_name
    bweb = brand.official_website if brand else None

    res = analyze_mobile_app(
        app_name=req.app_name,
        developer=req.developer,
        package_identifier=req.package_identifier,
        description=req.description or "",
        website=req.website or "",
        requested_permissions=req.requested_permissions,
        brand_name=bname,
        brand_website=bweb
    )

    # Persist investigation
    new_inv = Investigation(
        title=f"Mobile App Inspection: {req.app_name} ({req.package_identifier})",
        entity_type="mobile_app",
        entity_identifier=req.package_identifier,
        brand_id=brand.id if brand else None,
        risk_score=res["risk_score"],
        risk_category=res["risk_category"],
        status="UNDER_REVIEW" if res["risk_score"] >= 60.0 else "OPEN",
        warning_signals=json.dumps(res["developer_reputation_flags"] + res["package_identifier_findings"]),
        contributing_factors=json.dumps(res["contributing_factors"]),
        evidence_summary=json.dumps({
            "app_name": req.app_name,
            "developer": req.developer,
            "permissions": req.requested_permissions
        }),
        missing_data=json.dumps(res["missing_verification_info"]),
        confidence_limitations=json.dumps([res["disclaimer"]]),
        recommended_actions=json.dumps(res["recommended_actions"]),
        analyst_notes=f"App store metadata inspect completed for '{req.app_name}'. Dangerous permissions: {len(res['dangerous_permissions_detected'])}."
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)

    res["investigation_id"] = new_inv.id
    return res
