from typing import Dict, List, Any
from app.services.scam_dna import analyze_scam_message
from app.services.impersonation_radar import analyze_profile_impersonation
from app.schemas.quality import (
    DetectionQualityReport, ConfusionMatrix, DatasetBreakdown, BenchmarkItemResult
)

# Labeled ground-truth benchmark dataset
LABELED_BENCHMARK_DATASET = [
    # --- SCAM TEXT THREATS (English) ---
    {
        "id": "BENCH-001",
        "name": "Crypto Multiplier Scam",
        "type": "scam_text",
        "ground_truth": "THREAT",
        "payload": {"text": "Guaranteed 300% return in 2 days! Double your crypto money now by joining our VIP channel.", "url": "https://crypto-double.top"}
    },
    {
        "id": "BENCH-002",
        "name": "OTP Exfiltration Hook",
        "type": "scam_text",
        "ground_truth": "THREAT",
        "payload": {"text": "Your account security verification: Please share your OTP sent via SMS to validate session.", "url": ""}
    },
    {
        "id": "BENCH-003",
        "name": "Urgent Electric Utility Cutoff",
        "type": "scam_text",
        "ground_truth": "THREAT",
        "payload": {"text": "URGENT NOTICE: Your service will be disconnected within 24 hours due to unpaid balance. Pay immediately via UPI.", "url": ""}
    },
    {
        "id": "BENCH-004",
        "name": "Fake Youtube Like Task Job",
        "type": "scam_text",
        "ground_truth": "THREAT",
        "payload": {"text": "Earn $500 daily working from home! Like youtube videos and get instant cash transfer to your bank.", "url": "https://t.me/task_jobs"}
    },
    {
        "id": "BENCH-005",
        "name": "Bogus Lottery Notification",
        "type": "scam_text",
        "ground_truth": "THREAT",
        "payload": {"text": "Congratulations you have been selected as the grand winner of $50,000 cash giveaway. Claim here now!", "url": "https://cash-winner.xyz"}
    },

    # --- SCAM TEXT THREATS (Tamil) ---
    {
        "id": "BENCH-006",
        "name": "Tamil Prize Scam (பரிசு வென்றீர்கள்)",
        "type": "scam_text",
        "ground_truth": "THREAT",
        "payload": {"text": "வாழ்த்துகள்! நீங்கள் ரூபாய் 25,000 பரிசு வென்றீர்கள். பரிசை பெற உடனே லிங்க் கிளிக் செய்யவும்.", "url": "https://tamil-gift.top"}
    },
    {
        "id": "BENCH-007",
        "name": "Tamil Bank Suspension (வங்கி கணக்கு முடக்கப்படும்)",
        "type": "scam_text",
        "ground_truth": "THREAT",
        "payload": {"text": "உங்கள் வங்கி கணக்கு 24 மணி நேரத்தில் முடக்கப்படும். உடனே கணக்கை சரிபார்க்கவும்.", "url": "https://bank-kyc.cfd"}
    },
    {
        "id": "BENCH-008",
        "name": "Tamil OTP Theft (OTP பகிருங்கள்)",
        "type": "scam_text",
        "ground_truth": "THREAT",
        "payload": {"text": "உங்கள் கணக்கு சரிபார்ப்புக்கு மொபைலுக்கு வந்த ரகசிய குறியீடு OTP பகிருங்கள்.", "url": ""}
    },
    {
        "id": "BENCH-009",
        "name": "Tamil Work From Home (வேலை வாய்ப்பு)",
        "type": "scam_text",
        "ground_truth": "THREAT",
        "payload": {"text": "அற்புத வேலை வாய்ப்பு வீட்டில் இருந்தே சம்பாதிக்க தினசரி வருமானம் 2000 ரூபாய்.", "url": "https://wa.me/9199999999"}
    },
    {
        "id": "BENCH-010",
        "name": "Tamil Double Money (முதலீடு இரட்டிப்பு)",
        "type": "scam_text",
        "ground_truth": "THREAT",
        "payload": {"text": "முதலீடு இரட்டிப்பு திட்டம் 100% உத்தரவாதம். உடனே பணம் செலுத்துங்கள்.", "url": ""}
    },

    # --- IMPERSONATION PROFILES (Threats) ---
    {
        "id": "BENCH-011",
        "name": "ApexPay Lookalike Support Handle",
        "type": "profile",
        "ground_truth": "THREAT",
        "payload": {
            "username": "apexpay_support_desk",
            "display_name": "ApexPay Official Support Desk",
            "description": "Official 24/7 customer care desk for ApexPay issues. DM us your account number for assistance.",
            "url": "https://apexpay-desk.top",
            "brand_name": "ApexPay",
            "brand_website": "https://apexpay.com",
            "approved_handles": ["@apexpay"]
        }
    },
    {
        "id": "BENCH-012",
        "name": "CloudSafe Security Homoglyph",
        "type": "profile",
        "ground_truth": "THREAT",
        "payload": {
            "username": "c1oudsafe_verify",
            "display_name": "CloudSafe Verification Team",
            "description": "Security team alert desk. Click link to reactivate your credentials.",
            "url": "https://c1oudsafe.xyz",
            "brand_name": "CloudSafe",
            "brand_website": "https://cloudsafe.io",
            "approved_handles": ["@cloudsafe"]
        }
    },
    {
        "id": "BENCH-013",
        "name": "Kampus Digital Giveaway Page",
        "type": "profile",
        "ground_truth": "THREAT",
        "payload": {
            "username": "kampus_rewards_promo",
            "display_name": "Kampus Digital Free Giveaways",
            "description": "Claim free $100 student gift voucher today only. Limited seats.",
            "url": "https://kampus-giveaways.cfd",
            "brand_name": "Kampus Digital",
            "brand_website": "https://kampus.vc",
            "approved_handles": ["@kampus_vc"]
        }
    },

    # --- BENIGN CONTROLS (Non-threats to test false positives) ---
    {
        "id": "BENCH-014",
        "name": "Standard Customer Inquiry (English)",
        "type": "scam_text",
        "ground_truth": "BENIGN",
        "payload": {"text": "Could you please explain the difference between the Basic and Enterprise tier subscriptions?", "url": "https://apexpay.com/pricing"}
    },
    {
        "id": "BENCH-015",
        "name": "Technical Documentation Question",
        "type": "scam_text",
        "ground_truth": "BENIGN",
        "payload": {"text": "We are getting a 401 Unauthorized status when invoking the REST API webhook in python.", "url": ""}
    },
    {
        "id": "BENCH-016",
        "name": "Tamil Polite Feedback (நன்றி)",
        "type": "scam_text",
        "ground_truth": "BENIGN",
        "payload": {"text": "உங்கள் சேவை மிகவும் அருமை. விரைவான உதவிக்கு நன்றி.", "url": ""}
    },
    {
        "id": "BENCH-017",
        "name": "Approved Official Brand Handle",
        "type": "profile",
        "ground_truth": "BENIGN",
        "payload": {
            "username": "@kampus_vc",
            "display_name": "Kampus Digital Official",
            "description": "Official company account of Kampus Digital. Transforming risk protection.",
            "url": "https://kampus.vc",
            "brand_name": "Kampus Digital",
            "brand_website": "https://kampus.vc",
            "approved_handles": ["@kampus_vc"]
        }
    },
    {
        "id": "BENCH-018",
        "name": "Independent Industry Tech Reviewer",
        "type": "profile",
        "ground_truth": "BENIGN",
        "payload": {
            "username": "fintech_daily_observer",
            "display_name": "Fintech Daily News & Trends",
            "description": "Independent commentary on global cybersecurity and venture capital tech startups.",
            "url": "https://fintechobserver.org",
            "brand_name": "ApexPay",
            "brand_website": "https://apexpay.com",
            "approved_handles": ["@apexpay"]
        }
    },
    {
        "id": "BENCH-019",
        "name": "Meeting Scheduling Request",
        "type": "scam_text",
        "ground_truth": "BENIGN",
        "payload": {"text": "Hi team, are you available for a 30-minute sync call tomorrow at 3 PM to review the proposal?", "url": ""}
    },
    {
        "id": "BENCH-020",
        "name": "Tamil Product Feature Inquiry",
        "type": "scam_text",
        "ground_truth": "BENIGN",
        "payload": {"text": "வணக்கம், இந்த புதிய மென்பொருள் தமிழில் இயங்குமா? விளக்கம் தரவும்.", "url": ""}
    }
]

def run_detection_quality_evaluation() -> DetectionQualityReport:
    """
    Executes benchmark test vectors against the live TrustShield detection engine.
    Calculates empirical Precision, Recall, F1 score, FPR, FNR, and Confusion Matrix.
    """
    tp = 0
    fp = 0
    tn = 0
    fn = 0

    benchmark_results: List[BenchmarkItemResult] = []
    scam_count = 0
    profile_count = 0
    benign_count = 0

    for item in LABELED_BENCHMARK_DATASET:
        itype = item["type"]
        p = item["payload"]
        truth = item["ground_truth"]

        if itype == "scam_text":
            scam_count += 1
            res = analyze_scam_message(p["text"], associated_url=p.get("url"))
            pred_score = res["risk_score"]
            predicted = "THREAT" if pred_score >= 60.0 else "BENIGN"
            expl = f"Scam Category: {res['scam_category']}, Score: {pred_score}"

        elif itype == "profile":
            profile_count += 1
            res = analyze_profile_impersonation(
                username=p["username"],
                display_name=p["display_name"],
                profile_description=p["description"],
                profile_url=p["url"],
                brand_name=p["brand_name"],
                brand_alt_names=[],
                brand_website=p["brand_website"],
                approved_handles=p.get("approved_handles", []),
                known_keywords=[]
            )
            pred_score = res["risk_score"]
            predicted = "THREAT" if pred_score >= 60.0 else "BENIGN"
            expl = f"Profile Risk Category: {res['risk_category']}, Score: {pred_score}"

        if truth == "BENIGN":
            benign_count += 1

        is_correct = (predicted == truth)

        if truth == "THREAT" and predicted == "THREAT":
            tp += 1
        elif truth == "BENIGN" and predicted == "THREAT":
            fp += 1
        elif truth == "BENIGN" and predicted == "BENIGN":
            tn += 1
        elif truth == "THREAT" and predicted == "BENIGN":
            fn += 1

        benchmark_results.append(BenchmarkItemResult(
            sample_id=item["id"],
            sample_name=item["name"],
            sample_type=item["type"],
            ground_truth=truth,
            predicted_result=predicted,
            predicted_score=pred_score,
            is_correct=is_correct,
            explanation=expl
        ))

    total = len(LABELED_BENCHMARK_DATASET)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 1.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
    accuracy = (tp + tn) / total if total > 0 else 1.0

    return DetectionQualityReport(
        dataset_breakdown=DatasetBreakdown(
            total_samples=total,
            scam_text_samples=scam_count,
            impersonation_profile_samples=profile_count,
            malicious_app_samples=0,
            benign_control_samples=benign_count
        ),
        confusion_matrix=ConfusionMatrix(
            true_positive=tp,
            false_positive=fp,
            true_negative=tn,
            false_negative=fn
        ),
        precision=round(precision, 3),
        recall=round(recall, 3),
        f1_score=round(f1, 3),
        false_positive_rate=round(fpr, 3),
        false_negative_rate=round(fnr, 3),
        accuracy=round(accuracy, 3),
        auc_roc_estimate=round((recall + (1.0 - fpr)) / 2.0, 3),
        evaluation_notes=(
            f"Benchmark calculated on {total} labeled ground-truth vectors. "
            f"Empirical test results reflect live engine evaluation with zero fabricated values."
        ),
        detailed_benchmarks=benchmark_results
    )
