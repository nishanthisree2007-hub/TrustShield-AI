import re
from typing import Dict, List, Optional, Any
from app.services.brand_dna import compare_brand_dna
from app.services.risk_engine import calculate_explainable_risk
from app.services.scam_dna import analyze_scam_message

SUSPICIOUS_BIO_TRIGGERS = [
    r"\b(official customer support|support team|dm for help|message us on whatsapp|telegram link in bio)\b",
    r"\b(giveaway link|claim prize|free promo|bitcoin trading|crypto recovery|verified support)\b"
]

def analyze_profile_impersonation(
    username: str,
    display_name: str,
    profile_description: str,
    profile_url: str,
    brand_name: str,
    brand_alt_names: List[str],
    brand_website: str,
    approved_handles: List[str],
    known_keywords: List[str],
    profile_image_data: Optional[str] = None,
    brand_logo_hash: Optional[str] = None
) -> Dict[str, Any]:
    """Evaluates potential social profile impersonation using deterministic heuristics and Brand DNA."""
    warning_signals: List[str] = []
    
    # 1. Execute Brand DNA Comparison
    dna_results = compare_brand_dna(
        submitted_name=display_name,
        submitted_handle=username,
        submitted_url=profile_url,
        brand_name=brand_name,
        brand_alt_names=brand_alt_names,
        brand_website=brand_website,
        approved_handles=approved_handles,
        known_keywords=known_keywords,
        submitted_image_b64=profile_image_data,
        brand_logo_hash=brand_logo_hash
    )

    if dna_results["is_approved_channel"]:
        # Whitelisted official channel
        return {
            "risk_score": 0.0,
            "risk_category": "LOW",
            "brand_matched": brand_name,
            "similarity_score": 1.0,
            "detected_warning_signals": [],
            "evidence": [{"type": "whitelist", "detail": f"Official handle @{username} matches approved brand asset list."}],
            "missing_information": [],
            "confidence_limitations": ["Verified approved brand presence. Zero threat."],
            "contributing_factors": {"brand_username": 0.0, "scam_content": 0.0},
            "recommended_actions": ["No action necessary."]
        }

    # 2. Check Bio content for scam hooks or suspicious redirects
    bio_scam_score = 0.0
    bio_evidence: List[str] = []
    if profile_description and profile_description.strip():
        scam_res = analyze_scam_message(profile_description, associated_url=profile_url)
        if scam_res["risk_score"] > 25.0:
            bio_scam_score = scam_res["risk_score"]
            bio_evidence.extend(scam_res["evidence_explanation"])
            warning_signals.append(f"Deceptive phrasing detected in profile bio: {scam_res['scam_category']}")

        for trig in SUSPICIOUS_BIO_TRIGGERS:
            if re.search(trig, profile_description, re.IGNORECASE):
                warning_signals.append("Profile bio advertises unofficial support channels or prize claims")
                bio_scam_score = max(bio_scam_score, 65.0)
                break
    else:
        bio_scam_score = None  # Missing signal

    # 3. Handle Anomaly Checks
    brand_sim_pct = round(dna_results["overall_similarity_score"] * 100, 1)
    if dna_results["is_impersonation_candidate"]:
        warning_signals.append(f"High resemblance ({brand_sim_pct}%) to registered brand '{brand_name}' on unauthorized account")

    clean_u = username.strip().lstrip('@').lower()
    if re.search(r'([._-](support|official|help|care|real|service|desk))$', clean_u):
        warning_signals.append(f"Username @{clean_u} mimics official brand support nomenclature")

    # 4. Synthesize with Explainable Risk Engine
    brand_sub_score = dna_results["overall_similarity_score"] * 100.0 if dna_results["is_impersonation_candidate"] else (dna_results["overall_similarity_score"] * 30.0)
    logo_sub_score = (dna_results["logo_similarity_score"] * 100.0) if dna_results["logo_similarity_score"] is not None else None
    
    url_sub_score = None
    url_evidence = []
    if profile_url:
        domain_sim = dna_results["domain_similarity_score"]
        u_lower = profile_url.lower()
        if any(susp in u_lower for susp in [".top", ".xyz", ".vip", ".cfd", "desk", "support"]):
            url_sub_score = 90.0
            url_evidence.append("Profile links to known high-risk or typosquatted domain")
        elif domain_sim > 0.70 and domain_sim < 1.0:
            url_sub_score = 85.0
            url_evidence.append("Profile links to lookalike domain rather than official website")
        elif domain_sim == 1.0:
            url_sub_score = 0.0
        else:
            url_sub_score = 40.0

    metadata_score = 70.0 if len(warning_signals) >= 2 else (40.0 if warning_signals else 15.0)
    metadata_evidence = [f"Observed {len(warning_signals)} heuristic risk signals across account handles and presentation"]

    risk_assessment = calculate_explainable_risk(
        brand_or_username_score=brand_sub_score,
        brand_evidence=dna_results["evidence_breakdown"],
        logo_similarity_score=logo_sub_score,
        logo_evidence=["Logo image similarity analysis"] if logo_sub_score else [],
        suspicious_url_score=url_sub_score,
        url_evidence=url_evidence,
        scam_content_score=bio_scam_score,
        scam_evidence=bio_evidence,
        metadata_anomaly_score=metadata_score,
        metadata_evidence=metadata_evidence,
        is_whitelisted_official=False
    )

    formatted_evidence = []
    for ev in risk_assessment["evidence"]:
        formatted_evidence.append({"type": "heuristic", "detail": ev})

    return {
        "risk_score": risk_assessment["risk_score"],
        "risk_category": risk_assessment["risk_category"],
        "brand_matched": brand_name,
        "similarity_score": dna_results["overall_similarity_score"],
        "detected_warning_signals": warning_signals,
        "evidence": formatted_evidence,
        "missing_information": risk_assessment["missing_data"],
        "confidence_limitations": risk_assessment["confidence_limitations"],
        "contributing_factors": risk_assessment["contributing_factors"],
        "recommended_actions": risk_assessment["recommended_actions"]
    }
