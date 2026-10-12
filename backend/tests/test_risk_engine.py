import pytest
from app.services.risk_engine import calculate_explainable_risk

def test_explainable_risk_all_signals():
    result = calculate_explainable_risk(
        brand_or_username_score=85.0,
        brand_evidence=["High handle similarity"],
        logo_similarity_score=90.0,
        logo_evidence=["Perceptual logo match"],
        suspicious_url_score=95.0,
        url_evidence=["Typosquat domain .top"],
        scam_content_score=80.0,
        scam_evidence=["Fake giveaway hook"],
        metadata_anomaly_score=70.0,
        metadata_evidence=["Disposable account"]
    )
    assert result["risk_score"] > 80.0
    assert result["risk_category"] == "CRITICAL"
    assert "brand_username_similarity" in result["contributing_factors"]
    assert "suspicious_url_indicators" in result["contributing_factors"]
    assert len(result["evidence"]) >= 5

def test_explainable_risk_missing_signals_normalization():
    # If logo and metadata are missing, weights must normalize without penalizing as threat
    result = calculate_explainable_risk(
        brand_or_username_score=80.0,
        brand_evidence=["Lookalike handle"],
        logo_similarity_score=None,
        suspicious_url_score=None,
        scam_content_score=80.0,
        scam_evidence=["OTP extraction hook"]
    )
    # Available weights are brand (0.20) and scam (0.20) -> equal 50/50 split -> score should be 80.0
    assert abs(result["risk_score"] - 80.0) < 0.5
    assert result["risk_category"] == "CRITICAL"
    assert len(result["missing_data"]) >= 3
    assert any("Reference or candidate logo" in m for m in result["missing_data"])

def test_whitelisted_official_zero_risk():
    result = calculate_explainable_risk(
        brand_or_username_score=100.0,
        is_whitelisted_official=True
    )
    assert result["risk_score"] == 0.0
    assert result["risk_category"] == "LOW"
