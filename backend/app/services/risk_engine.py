from typing import Dict, List, Optional, Any
from app.config import settings

class RiskSignal:
    def __init__(self, name: str, default_weight: float, score: Optional[float], evidence: List[str], missing: bool = False):
        self.name = name
        self.default_weight = default_weight
        self.score = score  # 0.0 to 100.0 or None if missing
        self.evidence = evidence
        self.missing = missing

def calculate_explainable_risk(
    brand_or_username_score: Optional[float] = None,
    brand_evidence: Optional[List[str]] = None,
    logo_similarity_score: Optional[float] = None,
    logo_evidence: Optional[List[str]] = None,
    suspicious_url_score: Optional[float] = None,
    url_evidence: Optional[List[str]] = None,
    scam_content_score: Optional[float] = None,
    scam_evidence: Optional[List[str]] = None,
    metadata_anomaly_score: Optional[float] = None,
    metadata_evidence: Optional[List[str]] = None,
    is_whitelisted_official: bool = False
) -> Dict[str, Any]:
    """
    Computes deterministic, explainable risk score normalized across available signals.
    Configurable weights:
      - Brand/Username similarity: 20%
      - Logo similarity: 20%
      - Suspicious URL indicators: 25%
      - Scam content indicators: 20%
      - Account / Developer metadata: 15%
    Missing signals are NOT penalized as confirmed threats; weights are dynamically normalized.
    """
    if is_whitelisted_official:
        return {
            "risk_score": 0.0,
            "risk_category": "LOW",
            "contributing_factors": {
                "brand_username": 0.0,
                "logo": 0.0,
                "url": 0.0,
                "scam_content": 0.0,
                "metadata": 0.0
            },
            "evidence": ["Entity is cryptographically verified against the official brand whitelist."],
            "missing_data": [],
            "confidence_limitations": ["Verified official channel. No threat detected."],
            "recommended_actions": ["No action required. Whitelisted legitimate asset."]
        }

    signals = [
        RiskSignal(
            "brand_username_similarity",
            settings.RISK_WEIGHT_BRAND_SIMILARITY,
            brand_or_username_score,
            brand_evidence or [],
            missing=(brand_or_username_score is None)
        ),
        RiskSignal(
            "logo_similarity",
            settings.RISK_WEIGHT_LOGO_SIMILARITY,
            logo_similarity_score,
            logo_evidence or [],
            missing=(logo_similarity_score is None)
        ),
        RiskSignal(
            "suspicious_url_indicators",
            settings.RISK_WEIGHT_SUSPICIOUS_URL,
            suspicious_url_score,
            url_evidence or [],
            missing=(suspicious_url_score is None)
        ),
        RiskSignal(
            "scam_content_indicators",
            settings.RISK_WEIGHT_SCAM_CONTENT,
            scam_content_score,
            scam_evidence or [],
            missing=(scam_content_score is None)
        ),
        RiskSignal(
            "account_metadata_anomaly",
            settings.RISK_WEIGHT_ACCOUNT_METADATA,
            metadata_anomaly_score,
            metadata_evidence or [],
            missing=(metadata_anomaly_score is None)
        )
    ]

    active_signals = [s for s in signals if not s.missing and s.score is not None]
    missing_signals = [s for s in signals if s.missing or s.score is None]

    missing_data_reasons = []
    for m in missing_signals:
        if m.name == "logo_similarity":
            missing_data_reasons.append("Reference or candidate logo image was not supplied.")
        elif m.name == "suspicious_url_indicators":
            missing_data_reasons.append("No destination URL or domain was provided.")
        elif m.name == "scam_content_indicators":
            missing_data_reasons.append("No promotional text or message body was available to scan.")
        elif m.name == "account_metadata_anomaly":
            missing_data_reasons.append("Creation date or account profile metadata unavailable.")
        elif m.name == "brand_username_similarity":
            missing_data_reasons.append("No brand handle or name was provided.")

    if not active_signals:
        return {
            "risk_score": 0.0,
            "risk_category": "LOW",
            "contributing_factors": {},
            "evidence": ["Insufficient input data to compute risk score."],
            "missing_data": missing_data_reasons,
            "confidence_limitations": ["Score calculation aborted: zero telemetry signals available."],
            "recommended_actions": ["Submit at least one identifier, message text, or profile handle."]
        }

    # Normalize weights of available signals to sum to 1.0
    total_active_weight = sum(s.default_weight for s in active_signals)
    contributing_factors: Dict[str, float] = {}
    aggregated_score = 0.0
    all_evidence: List[str] = []

    for s in active_signals:
        normalized_weight = s.default_weight / total_active_weight
        weighted_contribution = (s.score or 0.0) * normalized_weight
        contributing_factors[s.name] = round(weighted_contribution, 2)
        aggregated_score += weighted_contribution
        all_evidence.extend(s.evidence)

    final_score = max(0.0, min(100.0, round(aggregated_score, 1)))

    # Determine risk category
    if final_score >= 80.0:
        risk_category = "CRITICAL"
    elif final_score >= 60.0:
        risk_category = "HIGH"
    elif final_score >= 30.0:
        risk_category = "MEDIUM"
    else:
        risk_category = "LOW"

    # Limitations & Recommendations
    confidence_limitations = []
    if missing_signals:
        omitted_pct = round(sum(s.default_weight for s in missing_signals) * 100)
        confidence_limitations.append(
            f"Telemetric limitation: {omitted_pct}% of theoretical evaluation vectors were absent. "
            f"Weights were re-normalized over {len(active_signals)} verified vectors."
        )
    confidence_limitations.append(
        "Scientific guardrail: Similarity metrics alone demonstrate resemblance, not legal malicious intent. Human review required."
    )

    recommended_actions = []
    if risk_category in ("CRITICAL", "HIGH"):
        recommended_actions.append("Initiate formal brand impersonation investigation.")
        recommended_actions.append("Export evidence dossier and issue abuse notification draft.")
        recommended_actions.append("Issue preventive security advisory to customers if active engagement observed.")
    elif risk_category == "MEDIUM":
        recommended_actions.append("Place entity on watch list for active behavioral monitoring.")
        recommended_actions.append("Acquire additional telemetry (DNS records, WHOIS data, screenshots).")
    else:
        recommended_actions.append("Entity maintains low risk indicators. Routine periodic check advised.")

    return {
        "risk_score": final_score,
        "risk_category": risk_category,
        "contributing_factors": contributing_factors,
        "evidence": all_evidence if all_evidence else ["No anomalous signals detected."],
        "missing_data": missing_data_reasons,
        "confidence_limitations": confidence_limitations,
        "recommended_actions": recommended_actions
    }
