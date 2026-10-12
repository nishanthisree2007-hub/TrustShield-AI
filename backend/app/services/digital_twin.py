import random
from typing import Dict, List, Any
from app.services.impersonation_radar import analyze_profile_impersonation
from app.services.scam_dna import analyze_scam_message
from app.services.mobile_inspector import analyze_mobile_app
from app.schemas.twin import DigitalTwinRunResponse, SimulatedScenarioResult

TYPOSQUAT_PATTERNS = [
    lambda b: f"{b}-official-security.top",
    lambda b: f"{b.replace('o', '0')}-support.vip",
    lambda b: f"login-{b}-auth.com",
    lambda b: f"{b}care-desk.xyz",
    lambda b: f"{b}-rewards-claim.cfd"
]

HANDLE_PATTERNS = [
    lambda h: f"@{h}_official_care",
    lambda h: f"@real_{h}_team",
    lambda h: f"@{h}_support_24x7",
    lambda h: f"@{h}__verify",
    lambda h: f"@claim_{h}_gift"
]

def generate_and_evaluate_synthetic_scenarios(
    brand_id: int,
    brand_name: str,
    brand_alt_names: List[str],
    brand_website: str,
    approved_handles: List[str],
    known_keywords: List[str]
) -> DigitalTwinRunResponse:
    """
    Executes defensive Digital Twin simulations.
    Generates synthetic threat vectors across 5 attack surfaces and tests them against the actual detection engines.
    """
    clean_bname = brand_name.lower().replace(" ", "")
    base_handle = approved_handles[0].lstrip('@') if approved_handles else clean_bname

    synthetic_scenarios: List[Dict[str, Any]] = [
        # 1. Typosquatting lookalike profile
        {
            "id": "SYNTH-01",
            "name": f"Lookalike Support Profile ({clean_bname}_support_24x7)",
            "type": "impersonation_profile",
            "expected_risk": "HIGH",
            "payload": {
                "username": f"{base_handle}_support_24x7",
                "display_name": f"{brand_name} Official Support",
                "description": f"Official customer support desk for {brand_name}. DM us for immediate resolution.",
                "url": f"https://{clean_bname}-support.top"
            }
        },
        # 2. Benign partner profile (Control test - checks for false positives!)
        {
            "id": "SYNTH-02",
            "name": f"Authorized Integration Partner ({clean_bname} Ecosystem)",
            "type": "impersonation_profile",
            "expected_risk": "LOW",
            "payload": {
                "username": f"{base_handle}_tech_community",
                "display_name": f"{brand_name} Devs & Open Source Community",
                "description": f"Community fan group discussing open APIs and developer tools for {brand_name}.",
                "url": brand_website
            }
        },
        # 3. Urgent Account Suspension Scam Message (English)
        {
            "id": "SYNTH-03",
            "name": "Deceptive Account Suspension Notice (SMS Spoof)",
            "type": "scam_message",
            "expected_risk": "CRITICAL",
            "payload": {
                "text": f"SECURITY ALERT: Your {brand_name} account will be permanently suspended within 24 hours. Click here to verify your identity immediately: https://{clean_bname}-login.vip/verify",
                "url": f"https://{clean_bname}-login.vip/verify"
            }
        },
        # 4. Giveaway / Lucky Draw Scam (Tamil Language Vector)
        {
            "id": "SYNTH-04",
            "name": "Tamil Promo Vector (பரிசு வென்றீர்கள்)",
            "type": "scam_message",
            "expected_risk": "CRITICAL",
            "payload": {
                "text": f"வாழ்த்துகள்! {brand_name} குலுக்கல் பரிசு வென்றீர்கள். உடனே உங்கள் பரிசை பெற கீழே உள்ள லிங்க் கிளிக் செய்து OTP பகிருங்கள்.",
                "url": f"https://{clean_bname}-prizes.cfd"
            }
        },
        # 5. Rogue APK Companion Application
        {
            "id": "SYNTH-05",
            "name": f"Trojanized Companion App (com.{clean_bname}.quickpay)",
            "type": "mobile_app",
            "expected_risk": "CRITICAL",
            "payload": {
                "app_name": f"{brand_name} QuickPay & Rewards",
                "developer": "Independent Dev Team <appmaker99@gmail.com>",
                "package": f"com.{clean_bname}.quickpay.mod",
                "description": f"Instant wallet and bonus payout utility for {brand_name} customers. Download now.",
                "website": f"https://{clean_bname}-mods.xyz",
                "permissions": [
                    "android.permission.RECEIVE_SMS",
                    "android.permission.READ_SMS",
                    "android.permission.BIND_ACCESSIBILITY_SERVICE",
                    "android.permission.SYSTEM_ALERT_WINDOW"
                ]
            }
        },
        # 6. Benign customer inquiry message (Control test)
        {
            "id": "SYNTH-06",
            "name": "Routine Customer Support Inquiry (Benign Control)",
            "type": "scam_message",
            "expected_risk": "LOW",
            "payload": {
                "text": f"Hello {brand_name} team, could you please tell me when the next software release is planned? Thanks!",
                "url": ""
            }
        },
        # 7. Urgent Payment Demanded SMS
        {
            "id": "SYNTH-07",
            "name": f"Billing Extortion Scam ({brand_name} Overdue Invoice)",
            "type": "scam_message",
            "expected_risk": "CRITICAL",
            "payload": {
                "text": f"FINAL DEMAND: Outstanding debt of $420 detected on your {brand_name} subscription. Pay immediately via UPI or service will be cut today.",
                "url": ""
            }
        },
        # 8. Fake Remote Job Recruitment
        {
            "id": "SYNTH-08",
            "name": f"Work-From-Home Task Scam ({brand_name} Hiring)",
            "type": "scam_message",
            "expected_risk": "HIGH",
            "payload": {
                "text": f"Exclusive {brand_name} Career Opportunity: Earn $300 daily working from home. Like videos on Telegram to earn guaranteed daily payout.",
                "url": "https://t.me/fake_careers"
            }
        }
    ]

    results: List[SimulatedScenarioResult] = []
    tp = 0
    fp = 0
    tn = 0
    fn = 0

    for sc in synthetic_scenarios:
        sc_type = sc["type"]
        p = sc["payload"]
        exp = sc["expected_risk"]

        if sc_type == "impersonation_profile":
            analysis = analyze_profile_impersonation(
                username=p["username"],
                display_name=p["display_name"],
                profile_description=p["description"],
                profile_url=p["url"],
                brand_name=brand_name,
                brand_alt_names=brand_alt_names,
                brand_website=brand_website,
                approved_handles=approved_handles,
                known_keywords=known_keywords
            )
            detected_score = analysis["risk_score"]
            detected_cat = analysis["risk_category"]

        elif sc_type == "scam_message":
            analysis = analyze_scam_message(
                message_text=p["text"],
                associated_url=p["url"],
                brand_name=brand_name
            )
            detected_score = analysis["risk_score"]
            detected_cat = analysis["risk_category"]

        elif sc_type == "mobile_app":
            analysis = analyze_mobile_app(
                app_name=p["app_name"],
                developer=p["developer"],
                package_identifier=p["package"],
                description=p["description"],
                website=p["website"],
                requested_permissions=p["permissions"],
                brand_name=brand_name,
                brand_website=brand_website
            )
            detected_score = analysis["risk_score"]
            detected_cat = analysis["risk_category"]

        # Classification verification
        is_threat_expected = exp in ("HIGH", "CRITICAL")
        is_threat_detected = detected_cat in ("HIGH", "CRITICAL") or detected_score >= 60.0

        is_fp = (not is_threat_expected) and is_threat_detected
        is_fn = is_threat_expected and (not is_threat_detected)
        passed = (is_threat_expected == is_threat_detected)

        if is_threat_expected and is_threat_detected:
            tp += 1
        elif is_fp:
            fp += 1
        elif (not is_threat_expected) and (not is_threat_detected):
            tn += 1
        elif is_fn:
            fn += 1

        rec = "Robust detection confirmed." if passed else "Tune risk thresholds for this vector."

        results.append(SimulatedScenarioResult(
            scenario_id=sc["id"],
            scenario_name=sc["name"],
            scenario_type=sc["type"],
            synthetic_payload=p,
            expected_risk=exp,
            detected_score=detected_score,
            detected_category=detected_cat,
            passed=passed,
            is_false_positive=is_fp,
            is_false_negative=is_fn,
            mitigation_recommendation=rec
        ))

    total = len(results)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 1.0
    resilience_score = round(f1 * 100, 1)

    return DigitalTwinRunResponse(
        brand_id=brand_id,
        brand_name=brand_name,
        total_scenarios_tested=total,
        scenarios_detected=tp + fp,
        false_positives=fp,
        false_negatives=fn,
        precision=round(precision, 3),
        recall=round(recall, 3),
        f1_score=round(f1, 3),
        brand_resilience_score=resilience_score,
        synthetic_label_warning="SYNTHETIC DEFENSIVE SIMULATION: All test vectors are generated for security posture evaluation and not deployed live.",
        scenario_results=results
    )
