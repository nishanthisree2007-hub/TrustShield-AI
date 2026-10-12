import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.brand import Brand
from app.models.investigation import Investigation
from app.models.user import User
from app.schemas.scam import ScamAnalysisRequest, ScamAnalysisResponse
from app.services.scam_dna import analyze_scam_message
from app.services.copilot import call_external_llm
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/scams", tags=["Scam DNA Analyzer"])

@router.post("/analyze", response_model=ScamAnalysisResponse)
async def analyze_scam(
    req: ScamAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = None
    if req.brand_id:
        brand = db.query(Brand).filter(Brand.id == req.brand_id).first()
    elif req.brand_name:
        brand = db.query(Brand).filter(Brand.name.ilike(req.brand_name)).first()

    bname = brand.name if brand else (req.brand_name or "Target Brand")

    res = analyze_scam_message(
        message_text=req.message_text,
        associated_url=req.associated_url,
        sender_handle_or_number=req.sender_handle_or_number,
        brand_name=bname
    )

    # Optional LLM contextual explanation if key available
    llm_expl = None
    if res["risk_score"] > 30.0:
        llm_prompt = (
            f"As a cybersecurity threat intelligence analyst, provide a 2-sentence executive summary of why the following message is deceptive:\n\n"
            f"Message: {req.message_text}\n"
            f"Detected Category: {res['scam_category']}\n"
            f"Risk Score: {res['risk_score']}"
        )
        llm_expl = await call_external_llm(llm_prompt)

    # Persist investigation
    new_inv = Investigation(
        title=f"Scam DNA Alert: {res['scam_category']} ({res['detected_language']})",
        entity_type="scam_message",
        entity_identifier=req.sender_handle_or_number or f"MSG-{hash(req.message_text) % 100000}",
        brand_id=brand.id if brand else None,
        risk_score=res["risk_score"],
        risk_category=res["risk_category"],
        status="UNDER_REVIEW" if res["risk_score"] >= 60.0 else "OPEN",
        warning_signals=json.dumps(res["evidence_explanation"]),
        contributing_factors=json.dumps({"scam_pattern_weight": res["risk_score"]}),
        evidence_summary=json.dumps({
            "message_text": req.message_text,
            "url": req.associated_url,
            "lang": res["detected_language"]
        }),
        missing_data=json.dumps(["Sender telecom identity or originating server headers"]),
        confidence_limitations=json.dumps(["Scam pattern heuristic matched known phrase dictionary."]),
        recommended_actions=json.dumps(res["protective_recommendations"]),
        analyst_notes=f"Analyzed by Scam DNA Analyzer. Category: {res['scam_category']}."
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)

    res["llm_explanation"] = llm_expl
    res["investigation_id"] = new_inv.id
    return res
