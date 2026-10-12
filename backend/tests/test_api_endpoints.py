import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "TrustShield" in data["service"]

def test_list_brands():
    res = client.get("/api/brands")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_profile_analysis():
    payload = {
        "username": "apexpay_support_24x7",
        "display_name": "ApexPay Support",
        "profile_description": "Official support. DM us your account details.",
        "profile_url": "https://apexpay-desk.top",
        "target_brand_name": "ApexPay"
    }
    res = client.post("/api/profiles/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "risk_score" in data
    assert "risk_category" in data
    assert data["risk_score"] > 50.0

def test_scam_analysis():
    payload = {
        "message_text": "Security Alert: Verify your account immediately at https://login-phish.xyz or account will be suspended.",
        "associated_url": "https://login-phish.xyz"
    }
    res = client.post("/api/scams/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["risk_score"] >= 70.0
    assert len(data["highlighted_phrases"]) >= 1

def test_dashboard_stats():
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_investigations" in data
    assert "risk_distribution" in data
    assert "threat_timeline" in data

def test_lab_evaluate():
    res = client.get("/api/lab/evaluate")
    assert res.status_code == 200
    data = res.json()
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data
    assert "confusion_matrix" in data

def test_threat_graph():
    res = client.get("/api/graph")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) >= 1
