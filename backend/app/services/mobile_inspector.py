from typing import Dict, List, Optional, Any
from app.services.brand_dna import levenshtein_similarity, analyze_domain_similarity
from app.services.risk_engine import calculate_explainable_risk
from app.schemas.app_inspector import PermissionRiskIndicator

DANGEROUS_PERMISSIONS_DB = {
    "android.permission.RECEIVE_SMS": {
        "risk_level": "DANGEROUS",
        "description": "Can intercept incoming SMS messages (commonly abused to steal two-factor banking OTPs).",
        "high_risk_categories": ["finance", "banking", "wallet", "social"]
    },
    "android.permission.READ_SMS": {
        "risk_level": "DANGEROUS",
        "description": "Can read stored SMS messages including confidential verification codes.",
        "high_risk_categories": ["finance", "banking", "wallet", "utility"]
    },
    "android.permission.BIND_ACCESSIBILITY_SERVICE": {
        "risk_level": "CRITICAL",
        "description": "Can read on-screen UI text, monitor key strokes, and execute autonomous screen clicks without user interaction.",
        "high_risk_categories": ["all"]
    },
    "android.permission.SYSTEM_ALERT_WINDOW": {
        "risk_level": "HIGH",
        "description": "Can display overlay windows on top of legitimate banking/login apps to phish credentials.",
        "high_risk_categories": ["all"]
    },
    "android.permission.REQUEST_INSTALL_PACKAGES": {
        "risk_level": "HIGH",
        "description": "Allows app to drop and install secondary unauthorized APK payloads from rogue external servers.",
        "high_risk_categories": ["all"]
    },
    "android.permission.RECORD_AUDIO": {
        "risk_level": "MEDIUM",
        "description": "Can access device microphone.",
        "high_risk_categories": ["utility", "finance"]
    },
    "android.permission.ACCESS_FINE_LOCATION": {
        "risk_level": "MEDIUM",
        "description": "Accesses precise GPS coordinates.",
        "high_risk_categories": ["utility"]
    }
}

def analyze_mobile_app(
    app_name: str,
    developer: str,
    package_identifier: str,
    description: str,
    website: str,
    requested_permissions: List[str],
    brand_name: Optional[str] = None,
    brand_website: Optional[str] = None
) -> Dict[str, Any]:
    """Inspects mobile application metadata for brand spoofing, dangerous permission combos, and missing verification."""
    package_findings: List[str] = []
    dev_flags: List[str] = []
    desc_anomalies: List[str] = []
    missing_verification: List[str] = []
    dangerous_perms: List[PermissionRiskIndicator] = []

    # 1. Package Identifier spoofing check
    pkg = package_identifier.lower().strip()
    if not pkg:
        missing_verification.append("Missing Android/iOS package identifier.")
    else:
        pkg_parts = pkg.split('.')
        if len(pkg_parts) < 2:
            package_findings.append(f"Abnormal or malformed package identifier: '{package_identifier}'")

        if brand_name:
            clean_bname = brand_name.lower().replace(" ", "")
            if clean_bname in pkg:
                if not developer or clean_bname not in developer.lower():
                    package_findings.append(
                        f"Package identifier '{package_identifier}' contains brand token '{clean_bname}', but developer '{developer}' is not verified as the brand owner."
                    )

    # 2. Brand Name Similarity
    brand_sim = 0.0
    if brand_name and app_name:
        brand_sim = levenshtein_similarity(app_name, brand_name)
        if brand_sim > 0.80 and app_name.lower() != brand_name.lower():
            package_findings.append(f"Application title '{app_name}' closely resembles brand '{brand_name}' ({round(brand_sim*100, 1)}% similarity)")

    # 3. Developer Verification & Reputation
    if not developer or developer.strip().lower() in ["unknown", "admin", "developer", "free app", "support"]:
        dev_flags.append(f"Generic or unverified developer name observed: '{developer}'")
        missing_verification.append("Developer legal entity and verified publisher certificates missing.")
    elif "@gmail.com" in developer.lower() or "@yahoo.com" in developer.lower():
        dev_flags.append(f"Commercial app published with disposable/personal email address: '{developer}'")

    # 4. Website Domain Verification
    domain_sim = None
    if website:
        if brand_website:
            domain_sim, dom_ev = analyze_domain_similarity(website, brand_website)
            if domain_sim > 0.70 and domain_sim < 1.0:
                dev_flags.append(f"Developer contact website '{website}' mimics official brand domain")
            elif domain_sim == 1.0:
                dev_flags.append(f"Developer website matches verified brand website")
        else:
            domain_sim = 0.5
    else:
        missing_verification.append("Developer contact website or privacy policy URL is missing.")

    # 5. Permission Analysis
    perm_risk_total = 0.0
    for perm in requested_permissions:
        clean_p = perm.strip()
        info = DANGEROUS_PERMISSIONS_DB.get(clean_p)
        if info:
            risk_lvl = info["risk_level"]
            is_suspicious = True
            if risk_lvl == "CRITICAL":
                perm_risk_total += 40.0
            elif risk_lvl == "DANGEROUS":
                perm_risk_total += 30.0
            elif risk_lvl == "HIGH":
                perm_risk_total += 15.0
            else:
                perm_risk_total += 5.0

            dangerous_perms.append(PermissionRiskIndicator(
                permission=clean_p,
                risk_level=risk_lvl,
                description=info["description"],
                is_suspicious_for_app_type=is_suspicious
            ))

    # 6. Description Analysis
    if description:
        if any(term in description.lower() for term in ["urgent update", "direct apk", "bypass google play", "install certificate", "disable play protect"]):
            desc_anomalies.append("Description instructs user to bypass Play Protect or install unverified certificates.")
    else:
        missing_verification.append("App store promotional description is blank.")

    # 7. Aggregate with Explainable Risk Engine
    brand_sub_score = (brand_sim * 100.0) if (brand_sim > 0.70 and len(dev_flags) > 0) else (brand_sim * 30.0)
    
    url_score = None
    if website:
        w_lower = website.lower()
        if any(susp in w_lower for susp in [".xyz", ".top", ".vip", ".cfd", "mods", "hack", "crack"]):
            url_score = 90.0
        elif any("mimics official brand" in f for f in dev_flags):
            url_score = 80.0
        elif domain_sim == 1.0:
            url_score = 0.0
        else:
            url_score = 40.0

    perm_score = min(100.0, perm_risk_total)
    metadata_score = 85.0 if (len(dev_flags) >= 1 and len(package_findings) >= 1) else (60.0 if dev_flags or package_findings else 15.0)

    risk_eval = calculate_explainable_risk(
        brand_or_username_score=brand_sub_score if brand_name else None,
        brand_evidence=[f"Brand similarity: {round(brand_sim*100, 1)}%"] if brand_name else [],
        logo_similarity_score=None,
        logo_evidence=[],
        suspicious_url_score=url_score,
        url_evidence=dev_flags if website else [],
        scam_content_score=perm_score,  # permission abuse mapping
        scam_evidence=[f"{len(dangerous_perms)} sensitive/dangerous permissions requested"],
        metadata_anomaly_score=metadata_score,
        metadata_evidence=package_findings + dev_flags,
        is_whitelisted_official=False
    )

    has_brand_token = False
    if brand_name:
        b_clean = brand_name.lower().replace(" ", "")
        if b_clean in app_name.lower() or b_clean in pkg:
            has_brand_token = True

    is_impersonation = (brand_sim > 0.75 or has_brand_token) and (len(dev_flags) > 0 or len(package_findings) > 0)

    disclaimer = (
        "METADATA-ONLY INSPECTION LIMITATION: TrustShield AI analyzes published application package metadata, developer signatures, and declared manifest permissions. "
        "It does NOT perform static bytecode de-compilation or runtime dynamic sandbox analysis."
    )

    recs = risk_eval["recommended_actions"]
    if is_impersonation or risk_eval["risk_category"] in ("CRITICAL", "HIGH"):
        recs.append("File trademark/copyright infringement report with app store provider.")
        recs.append("Alert brand legal counsel regarding rogue package namespace squatting.")

    return {
        "risk_score": risk_eval["risk_score"],
        "risk_category": risk_eval["risk_category"],
        "brand_impersonation_candidate": is_impersonation,
        "developer_reputation_flags": dev_flags,
        "package_identifier_findings": package_findings,
        "dangerous_permissions_detected": dangerous_perms,
        "description_anomalies": desc_anomalies,
        "missing_verification_info": missing_verification,
        "contributing_factors": risk_eval["contributing_factors"],
        "disclaimer": disclaimer,
        "recommended_actions": recs
    }
