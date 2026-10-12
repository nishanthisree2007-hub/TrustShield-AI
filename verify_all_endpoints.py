import sys
import os
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.abspath("backend"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_e2e_verification():
    print("========================================")
    print("TrustShield AI - Complete End-to-End API Verification")
    print("========================================")

    # 1. Health
    r = client.get("/health")
    assert r.status_code == 200, f"Health check failed: {r.status_code}"
    print(f"[PASS] [200] /health -> status: {r.json()['status']}")

    # 2. Auth Login
    r = client.post("/api/auth/token", data={"username": "demo_analyst", "password": "trustshield2026"})
    assert r.status_code == 200, f"Auth login failed: {r.text}"
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] [200] POST /api/auth/token -> JWT token issued")

    # 3. Auth Me
    r = client.get("/api/auth/me", headers=headers)
    assert r.status_code == 200
    print(f"[PASS] [200] GET /api/auth/me -> user: {r.json()['username']}")

    # 4. Brands List
    r = client.get("/api/brands", headers=headers)
    assert r.status_code == 200
    brands = r.json()
    assert len(brands) > 0
    apex_brand = next((b for b in brands if "ApexPay" in b["name"]), brands[0])
    brand_id = apex_brand["id"]
    print(f"[PASS] [200] GET /api/brands -> found {len(brands)} registered brands (using {apex_brand['name']} ID #{brand_id})")

    import time
    unique_brand_name = f"TestShield Verified {int(time.time())}"
    new_brand_payload = {
        "name": unique_brand_name,
        "official_website": "https://testshield.io",
        "alt_names": ["TestShield"],
        "approved_handles": ["@testshield_hq"],
        "support_channels": ["support@testshield.io"],
        "known_keywords": ["cyber", "defense"],
        "description": "Integration test brand"
    }
    r = client.post("/api/brands", json=new_brand_payload, headers=headers)
    assert r.status_code == 200
    created_brand_id = r.json()["id"]
    print(f"[PASS] [200] POST /api/brands -> created brand ID #{created_brand_id}")

    # 6. Brand Get
    r = client.get(f"/api/brands/{created_brand_id}", headers=headers)
    assert r.status_code == 200
    print(f"[PASS] [200] GET /api/brands/{created_brand_id} -> retrieved {r.json()['name']}")

    # 7. Brand Update
    r = client.put(f"/api/brands/{created_brand_id}", json={"description": "Updated description"}, headers=headers)
    assert r.status_code == 200
    print(f"[PASS] [200] PUT /api/brands/{created_brand_id} -> updated description")

    # 8. Profile Analyze (Impersonation Radar)
    r = client.post("/api/profiles/analyze", json={
        "username": "apexpay_fraud_alert",
        "display_name": "ApexPay Official Support Desk",
        "profile_description": "Contact us to unfreeze account immediately. DM password or OTP.",
        "profile_url": "https://apexpay-unfreeze.top",
        "brand_id": brand_id
    }, headers=headers)
    assert r.status_code == 200
    res = r.json()
    print(f"DEBUG profile result: score={res.get('risk_score')}, cat={res.get('risk_category')}, factors={res.get('contributing_factors')}")
    assert res["risk_category"] in ["MEDIUM", "HIGH", "CRITICAL"]
    print(f"[PASS] [200] POST /api/profiles/analyze -> score: {res['risk_score']}, category: {res['risk_category']}")

    # 9. Scam Analyze (Scam DNA - English & Tamil)
    r = client.post("/api/scams/analyze", json={
        "message_text": "வாழ்த்துகள்! நீங்கள் ரூபாய் 50,000 பரிசு வென்றீர்கள். உடனே உங்கள் பரிசை பெற கீழே உள்ள லிங்க் கிளிக் செய்து OTP பகிருங்கள்.",
        "sender_handle_or_number": "+91-94440-12345",
        "associated_url": "https://kampus-prizes.cfd"
    }, headers=headers)
    assert r.status_code == 200
    s_res = r.json()
    assert "Tamil" in s_res["detected_language"]
    assert s_res["risk_score"] > 60
    print(f"[PASS] [200] POST /api/scams/analyze -> Tamil dialect detected, score: {s_res['risk_score']}")

    # 10. App Inspect (Mobile App Trust Inspector)
    r = client.post("/api/apps/inspect", json={
        "app_name": "ApexPay QuickWallet Pro",
        "developer": "quickpay_mods@gmail.com",
        "package_identifier": "com.apexpay.quickwallet.mod",
        "description": "Exclusive bonus wallet APK for ApexPay users.",
        "website": "https://apexpay-mods.xyz",
        "requested_permissions": [
            "android.permission.RECEIVE_SMS",
            "android.permission.READ_SMS",
            "android.permission.BIND_ACCESSIBILITY_SERVICE"
        ],
        "brand_id": brand_id
    }, headers=headers)
    assert r.status_code == 200
    a_res = r.json()
    assert a_res["brand_impersonation_candidate"] is True
    print(f"[PASS] [200] POST /api/apps/inspect -> score: {a_res['risk_score']}, impersonation candidate: {a_res['brand_impersonation_candidate']}")

    # 11. Investigations List
    r = client.get("/api/investigations", headers=headers)
    assert r.status_code == 200
    invs = r.json()
    assert len(invs) > 0
    test_inv_id = invs[0]["id"]
    print(f"[PASS] [200] GET /api/investigations -> {len(invs)} dossiers retrieved")

    # 12. Investigation Get
    r = client.get(f"/api/investigations/{test_inv_id}", headers=headers)
    assert r.status_code == 200
    print(f"[PASS] [200] GET /api/investigations/{test_inv_id} -> title: {r.json()['title']}")

    # 13. Investigation Update Notes
    r = client.put(f"/api/investigations/{test_inv_id}", json={"analyst_notes": "Verified by SOC analyst."}, headers=headers)
    assert r.status_code == 200
    print(f"[PASS] [200] PUT /api/investigations/{test_inv_id} -> notes updated")

    # 14. Investigation Resolve
    r = client.post(f"/api/investigations/{test_inv_id}/resolve", params={"notes": "Takedown completed."}, headers=headers)
    assert r.status_code == 200
    assert r.json()["status"] == "RESOLVED"
    print(f"[PASS] [200] POST /api/investigations/{test_inv_id}/resolve -> status RESOLVED")

    # 15. Investigation False Positive
    r = client.post(f"/api/investigations/{test_inv_id}/false-positive", params={"reason": "Legitimate channel confirmed."}, headers=headers)
    assert r.status_code == 200
    assert r.json()["is_false_positive"] is True
    print(f"[PASS] [200] POST /api/investigations/{test_inv_id}/false-positive -> marked false positive")

    # 16. Threat Graph
    r = client.get("/api/graph", headers=headers)
    assert r.status_code == 200
    g_res = r.json()
    assert "nodes" in g_res and "edges" in g_res
    print(f"[PASS] [200] GET /api/graph -> {len(g_res['nodes'])} nodes, {len(g_res['edges'])} edges in Cytoscape topology")

    # 17. Campaign Clustering
    r = client.get("/api/clustering", headers=headers)
    assert r.status_code == 200
    c_res = r.json()
    assert "clusters" in c_res
    print(f"[PASS] [200] GET /api/clustering -> {c_res['total_clusters_formed']} clusters formed across {c_res['total_messages_analyzed']} messages")

    # 18. Digital Twin Simulation
    r = client.post("/api/twin/simulate", json={"brand_id": brand_id}, headers=headers)
    assert r.status_code == 200
    t_res = r.json()
    assert "brand_resilience_score" in t_res
    print(f"[PASS] [200] POST /api/twin/simulate -> resilience score: {t_res['brand_resilience_score']}%, tested {t_res['total_scenarios_tested']} synthetic vectors")

    # 19. Evidence Vault
    r = client.get("/api/vault", headers=headers)
    assert r.status_code == 200
    print(f"[PASS] [200] GET /api/vault -> {len(r.json())} sealed evidence records")

    # 20. Copilot Query
    r = client.post("/api/copilot/query", json={
        "query_type": "draft_abuse_report",
        "investigation_id": test_inv_id
    }, headers=headers)
    assert r.status_code == 200
    copilot_res = r.json()
    assert "summary" in copilot_res
    assert copilot_res["abuse_report"] is not None
    print(f"[PASS] [200] POST /api/copilot/query -> abuse report draft generated, human approval required banner: '{copilot_res['requires_human_approval_banner']}'")

    # 21. Detection Quality Lab
    r = client.get("/api/lab/evaluate", headers=headers)
    assert r.status_code == 200
    lab_res = r.json()
    assert "confusion_matrix" in lab_res
    print(f"[PASS] [200] GET /api/lab/evaluate -> Precision: {lab_res['precision']*100:.1f}%, Recall: {lab_res['recall']*100:.1f}%, F1: {lab_res['f1_score']:.3f}")

    # 22. Dashboard Stats
    r = client.get("/api/dashboard/stats", headers=headers)
    assert r.status_code == 200
    dash = r.json()
    print(f"[PASS] [200] GET /api/dashboard/stats -> {dash['total_investigations']} total investigations, {dash['high_risk_findings']} high risk")

    # 23. Export JSON
    r = client.get("/api/export/investigations/json", headers=headers)
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/json"
    print(f"[PASS] [200] GET /api/export/investigations/json -> exported JSON")

    # 24. Export CSV
    r = client.get("/api/export/investigations/csv", headers=headers)
    assert r.status_code == 200
    assert "text/csv" in r.headers["content-type"]
    print(f"[PASS] [200] GET /api/export/investigations/csv -> exported CSV")

    # 25. Brand Delete Cleanup
    r = client.delete(f"/api/brands/{created_brand_id}", headers=headers)
    assert r.status_code == 200
    print(f"[PASS] [200] DELETE /api/brands/{created_brand_id} -> brand cleaned up successfully")

    print("========================================")
    print("ALL 25 API ENDPOINTS VERIFIED AND PASSING 100%!")
    print("========================================")

if __name__ == "__main__":
    run_e2e_verification()
