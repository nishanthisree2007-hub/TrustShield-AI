import pytest
from app.services.scam_dna import analyze_scam_message

def test_scam_dna_english_phishing():
    msg = "Security alert: Verify your account immediately by clicking the link: https://verify-login.xyz"
    res = analyze_scam_message(msg)
    assert res["scam_category"] == "Phishing"
    assert res["risk_score"] >= 80.0
    assert len(res["highlighted_phrases"]) >= 1
    assert res["detected_language"] == "en (English)"

def test_scam_dna_tamil_lottery_scam():
    msg = "வாழ்த்துகள்! நீங்கள் ரூபாய் 25,000 பரிசு வென்றீர்கள். உடனே உங்கள் பரிசை பெற OTP பகிருங்கள்."
    res = analyze_scam_message(msg)
    assert res["risk_score"] >= 85.0
    assert "ta" in res["detected_language"]
    assert any(p["language"] == "ta" for p in res["highlighted_phrases"])
    assert any("பரிசு வென்றீர்கள்" in p["phrase"] or "OTP பகிருங்கள்" in p["phrase"] for p in res["highlighted_phrases"])

def test_scam_dna_benign_message():
    msg = "Hello, could we schedule a catch-up call tomorrow at 10 AM to discuss the quarterly project update?"
    res = analyze_scam_message(msg)
    assert res["scam_category"] == "Benign"
    assert res["risk_score"] < 30.0
    assert res["risk_category"] == "LOW"
