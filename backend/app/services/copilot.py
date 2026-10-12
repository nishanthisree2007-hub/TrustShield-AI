import json
import httpx
from typing import Dict, List, Optional, Any
from app.config import settings
from app.schemas.copilot import (
    CopilotQueryRequest, CopilotQueryResponse, AbuseReportDraft, CustomerWarningDraft
)

async def call_external_llm(prompt: str) -> Optional[str]:
    """Attempts to call configured LLM API (Gemini or OpenAI) if key is provided."""
    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return text
        except Exception:
            pass

    if settings.OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}]
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"]
        except Exception:
            pass

    return None

def generate_copilot_response(
    query_type: str,
    investigation_data: Dict[str, Any],
    custom_prompt: Optional[str] = None
) -> CopilotQueryResponse:
    """
    Synthesizes investigation data to provide actionable cyber threat intelligence.
    Employs robust, high-fidelity rule-based cyber reasoning with mandatory human approval guardrails.
    """
    title = investigation_data.get("title", "Digital Threat Investigation")
    entity_id = investigation_data.get("entity_identifier", "Unknown Target")
    entity_type = investigation_data.get("entity_type", "digital_entity")
    risk_score = investigation_data.get("risk_score", 0.0)
    risk_category = investigation_data.get("risk_category", "LOW")
    warning_signals = investigation_data.get("warning_signals", [])
    evidence_summary = investigation_data.get("evidence_summary", {})
    brand_name = investigation_data.get("brand_name") or investigation_data.get("brand", {}).get("name") or "the Brand"

    # 1. Evidence Summary
    summary = (
        f"Investigation dossier for {entity_type} '{entity_id}' targeting {brand_name}. "
        f"Current risk level assessed at {risk_category} ({risk_score}/100). "
        f"Key warning triggers identified: {len(warning_signals)} specific deceptive indicators."
    )

    # 2. Key Risk Drivers
    risk_drivers = []
    if risk_score >= 60.0:
        risk_drivers.append(f"Significant brand visual/lexical spoofing targeting legitimate brand '{brand_name}'")
    if warning_signals:
        risk_drivers.extend(warning_signals[:4])
    else:
        risk_drivers.append("Standard heuristic review indicates low malicious probability.")

    # 3. Missing Evidence
    missing_evidence = [
        "Passive DNS historical resolution history",
        "WHOIS registrant privacy proxy ownership records",
        "Autonomous System Number (ASN) upstream hosting attribution",
        "Target endpoint SSL/TLS certificate transparency logs"
    ]

    # 4. Recommended Next Steps
    rec_steps = [
        "Preserve cryptographic snapshot of target asset with SHA-256 hash in Evidence Vault.",
        f"Verify whether handle '{entity_id}' is authorized under brand affiliate contracts.",
        "Submit takedown notification to registrar and hosting provider if unauthorized.",
        "Add entity to Brand Impersonation Radar persistent telemetry monitor."
    ]

    abuse_draft = None
    if query_type == "draft_abuse_report" or (query_type in ("general", "recommend_steps") and risk_score >= 50.0):
        abuse_draft = AbuseReportDraft(
            target_entity=entity_id,
            target_type="Domain Registrar / Hosting Provider / Social Platform Trust & Safety",
            subject_line=f"[URGENT] Formal Digital Brand Impersonation & Trademark Infringement Notice - {brand_name}",
            report_body=(
                f"To Trust & Safety Legal Compliance Team,\n\n"
                f"We represent {brand_name} regarding active brand impersonation and digital deception.\n\n"
                f"Incident Target: {entity_id}\n"
                f"Category: {entity_type.upper()}\n"
                f"Assessed Threat Level: {risk_category} (Score: {risk_score}/100)\n\n"
                f"Infringement Summary:\n"
                f"The referenced asset is deliberately mimicking registered trademarks, approved customer support handles, "
                f"and logos of {brand_name} without authorization. Deceptive vectors include:\n"
                + "\n".join([f"- {s}" for s in risk_drivers]) +
                f"\n\nWe request immediate suspension, de-indexing, and takedown of this deceptive entity to mitigate customer fraud.\n\n"
                f"Best regards,\nTrustShield AI Incident Response Unit"
            ),
            evidence_attachments=[f"Evidence Dossier #{investigation_data.get('id', 'NEW')}.json", "SHA-256 Integrity Verification.txt"],
            legal_basis="Unauthorized trademark exploitation, deceptive consumer impersonation, and fraudulent phishing hooks.",
            requires_human_approval=True
        )

    # 6. Draft Customer Warning
    warning_draft = None
    if query_type in ("customer_warning", "general", "recommend_steps") and risk_score >= 50.0:
        warning_draft = CustomerWarningDraft(
            title=f"Security Advisory: Beware of Rogue Accounts Mimicking {brand_name}",
            urgency_tier="CRITICAL_ALERT" if risk_score >= 80 else "WARNING",
            short_advisory=f"TrustShield AI has detected unauthorized channels masquerading as official {brand_name} support representatives.",
            detailed_guidelines=[
                f"Verify handles against the official website before responding to DMs or emails.",
                f"{brand_name} will NEVER ask you for your account password, PIN, or one-time OTP.",
                f"Report any unsolicited messages directing you to alternate websites or telegram chats immediately."
            ],
            channel_recommendations=["Twitter/X Public Advisory", "In-App Notification Banner", "Support Center Header Notice"],
            requires_human_approval=True
        )

    detailed_explanation = (
        f"Analyst Analysis Report: Entity '{entity_id}' presents a risk score of {risk_score}. "
        f"Deterministic evaluation analyzed brand DNA overlap, domain proximity, and content deception heuristics. "
        f"Primary drivers include: {'; '.join(risk_drivers[:2])}. "
        f"Analysts are advised to conduct WHOIS queries and preserve evidence before issuing formal takedowns."
    )

    return CopilotQueryResponse(
        query_type=query_type,
        summary=summary,
        detailed_explanation=detailed_explanation,
        key_risk_drivers=risk_drivers,
        identified_missing_evidence=missing_evidence,
        recommended_next_steps=rec_steps,
        abuse_report=abuse_draft,
        customer_warning=warning_draft,
        is_rule_based_fallback=True,
        requires_human_approval_banner="CONFIRMATION REQUIRED: Human analyst verification is mandatory prior to sending notices or executing external actions."
    )
