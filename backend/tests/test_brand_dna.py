import pytest
from app.services.brand_dna import (
    levenshtein_distance, levenshtein_similarity, jaro_winkler_similarity,
    analyze_domain_similarity, compare_brand_dna
)

def test_string_metrics():
    assert levenshtein_distance("paypal", "paypal") == 0
    assert levenshtein_distance("paypal", "paypa1") == 1
    assert levenshtein_similarity("kampus", "kampus") == 1.0
    assert jaro_winkler_similarity("apexpay", "apexpay_support") > 0.80

def test_domain_similarity_homoglyph():
    sim, evidence = analyze_domain_similarity("c1oudsafe-support.top", "cloudsafe.io")
    assert sim >= 0.70
    assert any("Homoglyph" in e or "lookalike" in e or "top" in e for e in evidence)

def test_brand_dna_approved_channel():
    res = compare_brand_dna(
        submitted_name="Kampus Digital Official",
        submitted_handle="@kampus_vc",
        submitted_url="https://kampus.vc",
        brand_name="Kampus Digital",
        brand_alt_names=["Kampus"],
        brand_website="https://kampus.vc",
        approved_handles=["@kampus_vc"],
        known_keywords=["kampus"]
    )
    assert res["is_approved_channel"] is True
    assert res["risk_level"] == "BENIGN"

def test_brand_dna_impersonation_candidate():
    res = compare_brand_dna(
        submitted_name="ApexPay Support Desk",
        submitted_handle="@apexpay_helpdesk_24x7",
        submitted_url="https://apexpay-support.top",
        brand_name="ApexPay",
        brand_alt_names=[],
        brand_website="https://apexpay.com",
        approved_handles=["@apexpay"],
        known_keywords=["apexpay"]
    )
    assert res["is_impersonation_candidate"] is True
    assert res["risk_level"] in ("HIGH", "CRITICAL")
