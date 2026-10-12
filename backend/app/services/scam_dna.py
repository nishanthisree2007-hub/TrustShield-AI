import re
from typing import Dict, List, Optional, Tuple, Any
from app.schemas.scam import HighlightedPhrase

SCAM_PATTERNS = {
    "Fake Giveaway": {
        "en": [
            r"\b(won|winner|claim your prize|lucky draw|free gift card|cash giveaway|congratulations you have been selected)\b",
            r"\b(claim (here|now)|free \$?\d+|win free iphone|jackpot winner|lottery winning)\b"
        ],
        "ta": [
            r"(பரிசு வென்றீர்கள்|இலவச பரிசு|ரூபாய் பரிசு|குலுக்கல் பரிசு|லக்கி டிரா|பரிசை பெற|வெற்றி பெற்றுள்ளீர்கள்)",
            r"(இலவச மொபைல்|இலவச ரீசார்ஜ்|ரூபாய் வென்றுள்ளீர்கள்)"
        ],
        "severity": "HIGH",
        "base_score": 75.0,
        "recommendation": "Never click reward claim links. Legitimate entities do not ask for shipping fees or upfront taxes to receive prizes."
    },
    "Phishing": {
        "en": [
            r"\b(verify your account|login immediately|click here to verify|security alert: unauthorized access|confirm your identity)\b",
            r"\b(reactivate your account|update your billing info|unusual sign-in activity|click the link below to validate)\b"
        ],
        "ta": [
            r"(உங்கள் கணக்கை உடனே சரிபார்க்கவும்|கணக்கு சரிபார்ப்பு|இணைப்பை கிளிக் செய்யவும்|கீழே உள்ள லிங்க்|பாதுகாப்பு எச்சரிக்கை|உள்நுழைய இங்கே கிளிக் செய்யவும்)"
        ],
        "severity": "CRITICAL",
        "base_score": 90.0,
        "recommendation": "Do not enter login credentials or personal data into unsolicited URLs. Navigate to the verified official portal directly."
    },
    "Urgent Payment Request": {
        "en": [
            r"\b(pay immediately|urgent processing fee|payment required within \d+ hours|transfer funds now|wire money today)\b",
            r"\b(outstanding debt payment|final demand notice|settle balance now|send money via upi|gift card payment)\b"
        ],
        "ta": [
            r"(உடனே பணம் செலுத்துங்கள்|கட்டணம் செலுத்தவும்|பணம் அனுப்பவும்|முன்பணம்|கடைசி எச்சரிக்கை பணம்|உடனடி கட்டணம்)",
            r"(UPI மூலம் பணம் அனுப்பவும்|கூகிள் பே மூலம் அனுப்பவும்)"
        ],
        "severity": "CRITICAL",
        "base_score": 88.0,
        "recommendation": "Refuse urgent payment demands sent via social channels or chat apps. Official billing is handled via registered invoices."
    },
    "Fake Customer Support": {
        "en": [
            r"\b(official customer support telegram|whatsapp helpline|connect with our live agent here|support desk 24/7 hotline)\b",
            r"\b(dm for assistance|our representative will assist on whatsapp|call customer care now)\b"
        ],
        "ta": [
            r"(வாடிக்கையாளர் சேவை|உதவி எண்|வாட்ஸ்அப் உதவி|டெலிகிராம் தொடர்பு|ஹெல்ப் டெஸ்க்|உடனடி உதவிக்கு அழைக்கவும்)"
        ],
        "severity": "HIGH",
        "base_score": 80.0,
        "recommendation": "Legitimate enterprise support will never request that you redirect to personal Telegram or WhatsApp accounts."
    },
    "Password or OTP Request": {
        "en": [
            r"\b(share your otp|send the 6-digit code|enter your password to proceed|verify your pin|one-time password needed)\b",
            r"\b(what is the code received|provide your 2fa code|forward verification sms)\b"
        ],
        "ta": [
            r"(OTP பகிருங்கள்|ரகசிய குறியீடு|கடவுச்சொல்|OTP அனுப்பவும்|ரகசிய எண்|ஒருமுறை கடவுச்சொல்|வந்த குறியீட்டை பகிரவும்)"
        ],
        "severity": "CRITICAL",
        "base_score": 98.0,
        "recommendation": "NEVER share OTPs or passwords with anyone. Banks and service providers will never ask for your one-time passcode."
    },
    "Fake Job Offer": {
        "en": [
            r"\b(earn \$?\d+ daily|work from home salary|part-time job hiring immediately|no experience needed earn money)\b",
            r"\b(like youtube videos to earn|telegram task job|daily payout guaranteed|part-time job opening)\b"
        ],
        "ta": [
            r"(வேலை வாய்ப்பு|வீட்டில் இருந்தே சம்பாதிக்க|தினசரி வருமானம்|பகுதி நேர வேலை|முதலீடு இல்லாமல் சம்பாதிக்க|வீட்டிலிருந்தே வேலை)"
        ],
        "severity": "HIGH",
        "base_score": 75.0,
        "recommendation": "Beware of task-based payment scams or requests for security deposits prior to starting remote freelance tasks."
    },
    "Account Suspension Scam": {
        "en": [
            r"\b(account will be (permanently )?suspended|service disconnected within 24 hours|kyc expired action required)\b",
            r"\b(your electricity will be cut|bank account deactivated|sim card blocked today|immediate closure notice)\b"
        ],
        "ta": [
            r"(வங்கி கணக்கு முடக்கப்படும்|கணக்கு ரத்து செய்யப்படும்|24 மணி நேரத்தில் முடக்கப்படும்|மின் இணைப்பு துண்டிக்கப்படும்|சிம் கார்டு பிளாக் செய்யப்படும்)"
        ],
        "severity": "CRITICAL",
        "base_score": 92.0,
        "recommendation": "Fake suspension deadlines are used to induce panic. Contact official helpline numbers verified on your physical cards."
    },
    "Suspicious Investment Promise": {
        "en": [
            r"\b(double your money in|guaranteed \d+% return|crypto multiplier scheme|risk-free investment|secret trading signal)\b",
            r"\b(turn \$\d+ into \$\d+|guaranteed profit every day|vip crypto group)\b"
        ],
        "ta": [
            r"(முதலீடு இரட்டிப்பு|உறுதியான லாபம்|கிரிப்டோ முதலீடு|100% உத்தரவாதம்|குறைந்த முதலீட்டில் அதிக லாபம்|பணம் இரட்டிப்பாகும்)"
        ],
        "severity": "HIGH",
        "base_score": 85.0,
        "recommendation": "High guaranteed returns with zero risk are the hallmark of Ponzi schemes. Regulated financial products cannot promise fixed multipliers."
    }
}

def detect_language(text: str) -> str:
    # Check for Tamil unicode range \u0B80-\u0BFF
    tamil_chars = len(re.findall(r'[\u0B80-\u0BFF]', text))
    if tamil_chars > 3:
        if len(re.findall(r'[a-zA-Z]', text)) > 5:
            return "ta-en (Bilingual)"
        return "ta (Tamil)"
    return "en (English)"

def analyze_scam_message(
    message_text: str,
    associated_url: Optional[str] = None,
    sender_handle_or_number: Optional[str] = None,
    brand_name: Optional[str] = None
) -> Dict[str, Any]:
    """Analyzes message for English and Tamil scam tactics, highlighting phrases and evaluating risk."""
    if not message_text or not message_text.strip():
        return {
            "scam_category": "Benign",
            "risk_score": 0.0,
            "risk_category": "LOW",
            "detected_language": "Unknown",
            "highlighted_phrases": [],
            "evidence_explanation": ["No message text supplied."],
            "detected_tactics": [],
            "urgency_level": "None",
            "protective_recommendations": []
        }

    lang = detect_language(message_text)
    detected_phrases: List[HighlightedPhrase] = []
    category_scores: Dict[str, float] = {}
    evidence_points: List[str] = []
    tactics: List[str] = []
    protective_recs: List[str] = []

    for category, cat_data in SCAM_PATTERNS.items():
        found_in_category = False
        # Test English patterns
        for pattern in cat_data["en"]:
            for match in re.finditer(pattern, message_text, re.IGNORECASE):
                found_in_category = True
                phrase_text = match.group(0)
                detected_phrases.append(HighlightedPhrase(
                    phrase=phrase_text,
                    category=category,
                    severity=cat_data["severity"],
                    start_char=match.start(),
                    end_char=match.end(),
                    language="en"
                ))
        # Test Tamil patterns
        for pattern in cat_data["ta"]:
            for match in re.finditer(pattern, message_text, re.IGNORECASE):
                found_in_category = True
                phrase_text = match.group(0)
                detected_phrases.append(HighlightedPhrase(
                    phrase=phrase_text,
                    category=category,
                    severity=cat_data["severity"],
                    start_char=match.start(),
                    end_char=match.end(),
                    language="ta"
                ))

        if found_in_category:
            category_scores[category] = cat_data["base_score"]
            tactics.append(category)
            evidence_points.append(f"Scam indicator detected: {category} pattern identified in message text.")
            protective_recs.append(cat_data["recommendation"])

    # Analyze URL indicators if provided or present in text
    urls_in_text = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', message_text)
    if associated_url:
        urls_in_text.append(associated_url)

    url_penalty = 0.0
    for u in urls_in_text:
        u_lower = u.lower()
        if any(susp in u_lower for susp in [".xyz", ".top", ".vip", ".cfd", "bit.ly", "tinyurl", "t.me", "wa.me", "support-"]):
            url_penalty = max(url_penalty, 20.0)
            evidence_points.append(f"High-risk redirect/destination link observed: {u}")
        else:
            url_penalty = max(url_penalty, 10.0)
            evidence_points.append(f"External link embedded in unsolicited communication: {u}")

    # Check urgency signals
    urgency_level = "None"
    urgent_matches = re.findall(r'\b(urgent|immediate|within \d+ hours|act now|today only|உடனே|இன்றே|கடைசி நேரம்)\b', message_text, re.IGNORECASE)
    if len(urgent_matches) >= 2:
        urgency_level = "Severe"
        evidence_points.append("Psychological pressure tactic: Extreme time urgency enforced.")
    elif len(urgent_matches) == 1:
        urgency_level = "Moderate"
        evidence_points.append("Pressure tactic: Artificial urgency detected.")

    # Calculate overall risk score
    if not category_scores:
        final_score = min(url_penalty, 30.0)
        top_category = "Benign"
        risk_category = "LOW" if final_score < 30.0 else "MEDIUM"
        if not evidence_points:
            evidence_points.append("No known fraudulent phrasing or deceptive indicators detected.")
    else:
        top_category = max(category_scores, key=category_scores.get)
        base_cat_score = category_scores[top_category]
        
        # Multiple tactics exacerbate risk
        tactic_boost = (len(category_scores) - 1) * 5.0
        final_score = min(100.0, base_cat_score + tactic_boost + url_penalty)
        
        if final_score >= 80.0:
            risk_category = "CRITICAL"
        elif final_score >= 60.0:
            risk_category = "HIGH"
        elif final_score >= 30.0:
            risk_category = "MEDIUM"
        else:
            risk_category = "LOW"

    # Deduplicate recommendations
    unique_recs = list(dict.fromkeys(protective_recs))
    if not unique_recs:
        unique_recs.append("Standard caution: Verify the identity of the sender through independent communication channels.")

    return {
        "scam_category": top_category,
        "risk_score": round(final_score, 1),
        "risk_category": risk_category,
        "detected_language": lang,
        "highlighted_phrases": [p.model_dump() for p in detected_phrases],
        "evidence_explanation": evidence_points,
        "detected_tactics": tactics,
        "urgency_level": urgency_level,
        "protective_recommendations": unique_recs
    }
