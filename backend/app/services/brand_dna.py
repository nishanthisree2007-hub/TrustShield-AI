import re
import math
from typing import Dict, List, Optional, Tuple, Any
from urllib.parse import urlparse
from PIL import Image
import io
import base64

def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculates classic Levenshtein edit distance."""
    s1, s2 = s1.lower(), s2.lower()
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def levenshtein_similarity(s1: str, s2: str) -> float:
    """Normalized similarity score between 0.0 and 1.0 based on edit distance."""
    if not s1 and not s2:
        return 1.0
    if not s1 or not s2:
        return 0.0
    dist = levenshtein_distance(s1, s2)
    max_len = max(len(s1), len(s2))
    return max(0.0, 1.0 - (dist / max_len))

def jaro_winkler_similarity(s1: str, s2: str, p: float = 0.1) -> float:
    """Calculates Jaro-Winkler similarity tailored for brand typosquatting."""
    s1, s2 = s1.lower(), s2.lower()
    len1, len2 = len(s1), len(s2)
    if len1 == 0 and len2 == 0:
        return 1.0
    if len1 == 0 or len2 == 0:
        return 0.0

    match_distance = max(len1, len2) // 2 - 1
    s1_matches = [False] * len1
    s2_matches = [False] * len2

    matches = 0
    transpositions = 0

    for i in range(len1):
        start = max(0, i - match_distance)
        end = min(i + match_distance + 1, len2)
        for j in range(start, end):
            if s2_matches[j] or s1[i] != s2[j]:
                continue
            s1_matches[i] = True
            s2_matches[j] = True
            matches += 1
            break

    if matches == 0:
        return 0.0

    k = 0
    for i in range(len1):
        if not s1_matches[i]:
            continue
        while not s2_matches[k]:
            k += 1
        if s1[i] != s2[k]:
            transpositions += 1
        k += 1

    jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0

    # Prefix scale
    prefix = 0
    max_prefix = min(4, min(len1, len2))
    for i in range(max_prefix):
        if s1[i] == s2[i]:
            prefix += 1
        else:
            break

    return jaro + prefix * p * (1.0 - jaro)

# Common typosquatting substitutions (homoglyphs / l33t speak)
HOMOGLYPH_MAP = {
    '0': 'o', '1': 'l', 'i': 'l', 'v': 'u', 'vv': 'w',
    '@': 'a', '$': 's', '5': 's', '3': 'e', '8': 'b'
}

SUSPICIOUS_TLDS = {
    'top', 'xyz', 'vip', 'cfd', 'cc', 'tk', 'ml', 'ga', 'cf',
    'gq', 'pw', 'bid', 'loan', 'click', 'support', 'live', 'club', 'work'
}

def normalize_text_homoglyphs(text: str) -> str:
    cleaned = text.lower()
    for char, replacement in HOMOGLYPH_MAP.items():
        cleaned = cleaned.replace(char, replacement)
    return cleaned

def extract_domain(url_or_domain: str) -> str:
    if not url_or_domain:
        return ""
    val = url_or_domain.strip().lower()
    if not val.startswith(("http://", "https://")):
        val = "https://" + val
    try:
        parsed = urlparse(val)
        domain = parsed.netloc or parsed.path
        domain = domain.split(':')[0]
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except Exception:
        return url_or_domain.lower()

def analyze_domain_similarity(submitted_domain_str: str, official_website_str: str) -> Tuple[float, List[str]]:
    submitted_domain = extract_domain(submitted_domain_str)
    official_domain = extract_domain(official_website_str)

    if not submitted_domain or not official_domain:
        return 0.0, ["Missing domain information for comparison"]

    if submitted_domain == official_domain:
        return 1.0, [f"Exact match with official domain: {official_domain}"]

    sub_parts = submitted_domain.split('.')
    off_parts = official_domain.split('.')
    
    sub_sld = sub_parts[-2] if len(sub_parts) >= 2 else submitted_domain
    off_sld = off_parts[-2] if len(off_parts) >= 2 else official_domain
    sub_tld = sub_parts[-1] if len(sub_parts) >= 1 else ""
    off_tld = off_parts[-1] if len(off_parts) >= 1 else ""

    evidence = []
    similarity = jaro_winkler_similarity(sub_sld, off_sld)
    
    # Check if official brand name is embedded as subdomain or path token
    if off_sld in submitted_domain and submitted_domain != official_domain:
        similarity = max(similarity, 0.88)
        evidence.append(f"Official brand name '{off_sld}' embedded inside foreign domain '{submitted_domain}'")

    # Check for homoglyphs
    norm_sub = normalize_text_homoglyphs(sub_sld)
    norm_off = normalize_text_homoglyphs(off_sld)
    if norm_sub == norm_off and sub_sld != off_sld:
        similarity = max(similarity, 0.95)
        evidence.append(f"Homoglyph / leetspeak character substitution detected between '{sub_sld}' and '{off_sld}'")

    # Check hyphenated variations (e.g. brand-security.com)
    if f"{off_sld}-" in sub_sld or f"-{off_sld}" in sub_sld:
        similarity = max(similarity, 0.85)
        evidence.append(f"Hyphenated brand lookalike detected: '{sub_sld}'")

    # Check suspicious TLD
    if sub_tld in SUSPICIOUS_TLDS:
        evidence.append(f"Suspicious high-risk top-level domain '.{sub_tld}' observed")
    elif sub_tld != off_tld:
        evidence.append(f"TLD mismatch: legitimate brand uses '.{off_tld}', candidate uses '.{sub_tld}'")

    if similarity > 0.75 and submitted_domain != official_domain:
        evidence.append(f"High domain lexical similarity ({round(similarity*100, 1)}%) to official domain '{official_domain}'")

    return round(similarity, 3), evidence

def compute_perceptual_hash(image_bytes: bytes) -> str:
    """Computes difference hash (dhash) for image comparison."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('L').resize((9, 8), Image.Resampling.LANCZOS)
        pixels = list(img.getdata())
        diff = []
        for row in range(8):
            for col in range(8):
                pixel_left = pixels[row * 9 + col]
                pixel_right = pixels[row * 9 + col + 1]
                diff.append('1' if pixel_left > pixel_right else '0')
        hex_hash = hex(int(''.join(diff), 2))[2:].zfill(16)
        return hex_hash
    except Exception:
        return ""

def compare_hashes(hash1: str, hash2: str) -> float:
    """Computes similarity percentage between two 16-hex perceptual hashes."""
    if not hash1 or not hash2 or len(hash1) != len(hash2):
        return 0.0
    try:
        int1 = int(hash1, 16)
        int2 = int(hash2, 16)
        hamming_distance = bin(int1 ^ int2).count('1')
        max_distance = len(hash1) * 4  # 64 bits
        similarity = 1.0 - (hamming_distance / max_distance)
        return max(0.0, min(1.0, similarity))
    except Exception:
        return 0.0

def compare_brand_dna(
    submitted_name: str,
    submitted_handle: str,
    submitted_url: str,
    brand_name: str,
    brand_alt_names: List[str],
    brand_website: str,
    approved_handles: List[str],
    known_keywords: List[str],
    submitted_image_b64: Optional[str] = None,
    brand_logo_hash: Optional[str] = None
) -> Dict[str, Any]:
    """Compares submitted digital entity against registered Brand DNA."""
    evidence = []
    
    # 1. Clean and normalize handles
    clean_sub_handle = submitted_handle.strip().lstrip('@').lower() if submitted_handle else ""
    clean_approved = [h.strip().lstrip('@').lower() for h in approved_handles]

    # Check exact approved match
    is_approved_handle = clean_sub_handle in clean_approved and clean_sub_handle != ""
    if is_approved_handle:
        evidence.append(f"Approved channel verified: @{clean_sub_handle} is in registered whitelist.")
        username_sim = 1.0
    else:
        # Check similarity to registered handle
        best_handle_sim = 0.0
        for approved in clean_approved:
            sim = jaro_winkler_similarity(clean_sub_handle, approved)
            # Detect impersonator suffixes/prefixes
            if approved in clean_sub_handle and approved != clean_sub_handle:
                affixes = ["support", "help", "care", "official", "real", "service", "desk", "verify", "agent"]
                if any(aff in clean_sub_handle for aff in affixes):
                    sim = max(sim, 0.92)
                    evidence.append(f"Handle @{clean_sub_handle} appends deceptive support/official modifier to legitimate handle @{approved}")
            if sim > best_handle_sim:
                best_handle_sim = sim
        username_sim = best_handle_sim

    # 2. Name Similarity
    best_name_sim = levenshtein_similarity(submitted_name, brand_name)
    matched_target_name = brand_name
    for alt in brand_alt_names:
        alt_sim = levenshtein_similarity(submitted_name, alt)
        if alt_sim > best_name_sim:
            best_name_sim = alt_sim
            matched_target_name = alt

    if best_name_sim > 0.85 and submitted_name.lower() != brand_name.lower():
        evidence.append(f"Display name '{submitted_name}' is visually and lexically close to '{matched_target_name}' ({round(best_name_sim*100, 1)}% match)")
    elif submitted_name.lower() == brand_name.lower():
        evidence.append(f"Display name '{submitted_name}' is an exact match for registered brand name")

    # 3. Domain Similarity
    domain_sim, domain_evidence = analyze_domain_similarity(submitted_url, brand_website)
    evidence.extend(domain_evidence)

    # 4. Brand Keyword Density
    if known_keywords and submitted_name:
        sub_text_lower = f"{submitted_name} {clean_sub_handle}".lower()
        matched_kw = [kw for kw in known_keywords if kw.lower() in sub_text_lower]
        if matched_kw:
            evidence.append(f"Registered brand keywords detected in profile: {', '.join(matched_kw)}")

    # 5. Logo similarity if provided
    logo_sim = None
    if submitted_image_b64 and brand_logo_hash:
        try:
            raw_img = base64.b64decode(submitted_image_b64.split(",")[-1])
            sub_hash = compute_perceptual_hash(raw_img)
            if sub_hash:
                logo_sim = compare_hashes(sub_hash, brand_logo_hash)
                evidence.append(f"Logo perceptual image match: {round(logo_sim*100, 1)}% similarity")
        except Exception:
            evidence.append("Logo image provided but decoding/comparison failed")

    # Weighted brand similarity score
    weights = [0.35, 0.35, 0.30]
    scores = [best_name_sim, username_sim, domain_sim]
    if logo_sim is not None:
        weights = [0.25, 0.25, 0.25, 0.25]
        scores.append(logo_sim)

    overall_similarity = sum(s * w for s, w in zip(scores, weights))

    is_impersonation_candidate = False
    if not is_approved_handle:
        if overall_similarity >= 0.70 or (username_sim >= 0.82 and domain_sim < 0.99):
            is_impersonation_candidate = True

    risk_level = "LOW"
    if is_approved_handle:
        risk_level = "BENIGN"
    elif overall_similarity >= 0.85:
        risk_level = "CRITICAL"
    elif overall_similarity >= 0.70:
        risk_level = "HIGH"
    elif overall_similarity >= 0.50:
        risk_level = "MEDIUM"

    return {
        "name_similarity_score": round(best_name_sim, 3),
        "username_similarity_score": round(username_sim, 3),
        "domain_similarity_score": round(domain_sim, 3),
        "logo_similarity_score": round(logo_sim, 3) if logo_sim is not None else None,
        "overall_similarity_score": round(overall_similarity, 3),
        "evidence_breakdown": evidence,
        "is_approved_channel": is_approved_handle,
        "is_impersonation_candidate": is_impersonation_candidate,
        "risk_level": risk_level
    }
