import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.brand import Brand
from app.models.investigation import Investigation
from app.models.evidence import Evidence
from app.models.threat_node import ThreatNode, ThreatEdge
from app.utils.security import get_password_hash

def seed_demo_data(db: Session):
    """Populates rich, realistic synthetic data for the hackathon showcase."""
    # 1. Users
    if not db.query(User).filter(User.username == "demo_analyst").first():
        analyst = User(
            username="demo_analyst",
            email="analyst@trustshield.ai",
            hashed_password=get_password_hash("trustshield2026"),
            role="admin",
            is_active=True
        )
        db.add(analyst)

    # 2. Brands
    existing_brands = db.query(Brand).count()
    if existing_brands == 0:
        kampus = Brand(
            name="Kampus Digital",
            alt_names=json.dumps(["Kampus", "Kampus VC", "Kampus Risk Engine"]),
            official_website="https://kampus.vc",
            approved_handles=json.dumps(["@kampus_vc", "@kampus_official"]),
            logo_hash="d41d8cd98f00b204e9800998ecf8427e",
            support_channels=json.dumps(["security@kampus.vc", "+1-800-KAMPUS"]),
            known_keywords=json.dumps(["kampus", "venture", "risk protection", "cybersecurity"]),
            description="Leading Digital Risk Protection and Venture Builder platform."
        )

        apex = Brand(
            name="ApexPay",
            alt_names=json.dumps(["Apex Payments", "Apex Wallet"]),
            official_website="https://apexpay.com",
            approved_handles=json.dumps(["@apexpay", "@apexpay_support"]),
            logo_hash="e2fc714c4727ee9395f324cd2e7f331f",
            support_channels=json.dumps(["support@apexpay.com", "+1-888-APEX-PAY"]),
            known_keywords=json.dumps(["apex", "wallet", "payments", "transfers", "fintech"]),
            description="Global high-speed consumer payments and merchant wallet gateway."
        )

        cloudsafe = Brand(
            name="CloudSafe",
            alt_names=json.dumps(["CloudSafe Corp", "CloudSafe Security"]),
            official_website="https://cloudsafe.io",
            approved_handles=json.dumps(["@cloudsafe_io", "@cloudsafe_hq"]),
            logo_hash="c4ca4238a0b923820dcc509a6f75849b",
            support_channels=json.dumps(["help@cloudsafe.io"]),
            known_keywords=json.dumps(["cloudsafe", "cloud security", "devsecops", "zero trust"]),
            description="Enterprise cloud security posture and zero-trust perimeter solutions."
        )

        db.add_all([kampus, apex, cloudsafe])
        db.commit()
        db.refresh(kampus)
        db.refresh(apex)
        db.refresh(cloudsafe)

        # 3. Investigations
        invs = [
            Investigation(
                title="Rogue Handle @apexpay_support_24x7 Phishing Campaign",
                entity_type="profile",
                entity_identifier="@apexpay_support_24x7",
                brand_id=apex.id,
                risk_score=94.5,
                risk_category="CRITICAL",
                status="UNDER_REVIEW",
                warning_signals=json.dumps([
                    "Username mimics official brand support nomenclature",
                    "Bio redirects users to unofficial Telegram payment desk",
                    "Domain apexpay-desk.top flagged as high-risk typosquat"
                ]),
                contributing_factors=json.dumps({"brand_username": 28.5, "url": 30.0, "scam_content": 22.0, "metadata": 14.0}),
                evidence_summary=json.dumps({"url": "https://apexpay-desk.top", "telegram": "t.me/apexpay_hotline"}),
                missing_data=json.dumps(["Domain registrar ownership identity hidden behind PrivacyGuardian"]),
                confidence_limitations=json.dumps(["Similarity metrics indicate strong impersonator heuristic."]),
                recommended_actions=json.dumps(["Issue domain registrar abuse notification", "Alert customers via X/Twitter advisory"]),
                analyst_notes="Active credential harvester discovered redirecting customers to rogue Telegram payment bot."
            ),
            Investigation(
                title="Tamil Urgent Lottery Scam (பரிசு வென்றீர்கள்) Vector",
                entity_type="scam_message",
                entity_identifier="SMS-+919876543210",
                brand_id=kampus.id,
                risk_score=88.0,
                risk_category="CRITICAL",
                status="OPEN",
                warning_signals=json.dumps([
                    "Fake giveaway tactic in Tamil (பரிசு வென்றீர்கள்)",
                    "Password/OTP extraction hook (OTP பகிருங்கள்)",
                    "Deceptive shortlink embedded: kampus-prizes.cfd"
                ]),
                contributing_factors=json.dumps({"scam_content": 45.0, "url": 30.0, "metadata": 13.0}),
                evidence_summary=json.dumps({"url": "https://kampus-prizes.cfd", "lang": "ta"}),
                missing_data=json.dumps(["Telecom originating tower geolocation"]),
                confidence_limitations=json.dumps(["SMS headers spoofed via external VoIP aggregator."]),
                recommended_actions=json.dumps(["Coordinate with regional telecom fraud exchange", "Publish regional advisory in Tamil"]),
                analyst_notes="Mass SMS blast observed across South Indian region targeting university applicants."
            ),
            Investigation(
                title="Trojanized Companion App: ApexPay QuickWallet Pro",
                entity_type="mobile_app",
                entity_identifier="com.apexpay.quickwallet.mod",
                brand_id=apex.id,
                risk_score=92.0,
                risk_category="CRITICAL",
                status="OPEN",
                warning_signals=json.dumps([
                    "Package namespace squatting on official brand token",
                    "Requests SMS interception permission (RECEIVE_SMS, READ_SMS)",
                    "Requests BIND_ACCESSIBILITY_SERVICE allowing autonomous screen control"
                ]),
                contributing_factors=json.dumps({"brand_username": 25.0, "metadata": 35.0, "scam_content": 32.0}),
                evidence_summary=json.dumps({"package": "com.apexpay.quickwallet.mod", "developer": "quickpay_mods@gmail.com"}),
                missing_data=json.dumps(["Third-party APK store hosting server logs"]),
                confidence_limitations=json.dumps(["Metadata-only inspection. Dynamic binary execution sandbox skipped."]),
                recommended_actions=json.dumps(["Submit DMCA takedown to third-party APK aggregator", "Warn user base"]),
                analyst_notes="Malicious APK spotted on third-party repository masquerading as official payment utility."
            ),
            Investigation(
                title="Typosquatting Domain: cloudsafe-verify.xyz",
                entity_type="domain",
                entity_identifier="cloudsafe-verify.xyz",
                brand_id=cloudsafe.id,
                risk_score=78.0,
                risk_category="HIGH",
                status="RESOLVED",
                warning_signals=json.dumps([
                    "High lexical similarity to official domain cloudsafe.io",
                    "Suspicious TLD .xyz commonly associated with disposable phishing kits"
                ]),
                contributing_factors=json.dumps({"brand_username": 25.0, "url": 40.0, "metadata": 13.0}),
                evidence_summary=json.dumps({"url": "https://cloudsafe-verify.xyz"}),
                missing_data=json.dumps([]),
                confidence_limitations=json.dumps([]),
                recommended_actions=json.dumps(["Monitor DNS for name server changes"]),
                analyst_notes="Registrar suspended rogue domain within 3 hours of TrustShield AI notification.",
                resolved_at=datetime.utcnow() - timedelta(days=1)
            ),
            Investigation(
                title="Authorized Partner Review: CloudSafe Community Hub",
                entity_type="profile",
                entity_identifier="@cloudsafe_community",
                brand_id=cloudsafe.id,
                risk_score=15.0,
                risk_category="LOW",
                status="FALSE_POSITIVE",
                is_false_positive=True,
                warning_signals=json.dumps([]),
                contributing_factors=json.dumps({"brand_username": 15.0}),
                evidence_summary=json.dumps({"url": "https://cloudsafe.io"}),
                missing_data=json.dumps([]),
                confidence_limitations=json.dumps([]),
                recommended_actions=json.dumps(["Add to approved brand asset directory"]),
                analyst_notes="Legitimate student and open-source enthusiast community channel.",
                resolved_at=datetime.utcnow() - timedelta(days=2)
            )
        ]

        db.add_all(invs)
        db.commit()

        # 4. Evidence Artifacts
        for inv in invs:
            ev = Evidence(
                investigation_id=inv.id,
                title=f"Initial Forensic Snapshot: {inv.entity_identifier}",
                evidence_type="data_snapshot",
                file_name=f"dossier_{inv.id}.json",
                file_size=2048,
                mime_type="application/json",
                sha256_hash="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
                description="Raw telemetry indicators, URL metadata, and heuristic scoring breakdown.",
                raw_payload=json.dumps({"entity": inv.entity_identifier, "risk": inv.risk_score})
            )
            db.add(ev)
        db.commit()
