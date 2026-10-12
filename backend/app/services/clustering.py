import re
from typing import Dict, List, Set, Any, Tuple
from collections import Counter
from app.schemas.cluster import CampaignCluster, CampaignClusterItem, CampaignClusteringResponse

def tokenize_and_shingle(text: str, n: int = 3) -> Set[str]:
    """Extracts character n-grams and normalized word tokens for text fingerprinting."""
    cleaned = re.sub(r'[^\w\s]', ' ', text.lower())
    words = [w for w in cleaned.split() if len(w) > 2]
    
    shingles: Set[str] = set()
    for w in words:
        shingles.add(f"w:{w}")
    
    # Add word 2-grams
    for i in range(len(words) - 1):
        shingles.add(f"2g:{words[i]}_{words[i+1]}")

    return shingles

def jaccard_similarity(set_a: Set[str], set_b: Set[str]) -> float:
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a.intersection(set_b))
    union = len(set_a.union(set_b))
    return float(intersection) / float(union) if union > 0 else 0.0

def extract_urls(text: str) -> List[str]:
    return re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)

def extract_common_phrases(texts: List[str], min_count: int = 2) -> List[str]:
    phrase_counter: Counter = Counter()
    for t in texts:
        cleaned = re.sub(r'[^\w\s]', ' ', t.lower())
        words = cleaned.split()
        # Look for 3-word and 4-word recurring sequences
        for length in [3, 4]:
            for i in range(len(words) - length + 1):
                phrase = " ".join(words[i:i + length])
                if len(phrase) > 10:
                    phrase_counter[phrase] += 1
    
    top = [p for p, count in phrase_counter.most_common(5) if count >= min_count]
    return top

def cluster_scam_messages(
    messages: List[Dict[str, Any]],
    similarity_threshold: float = 0.28
) -> CampaignClusteringResponse:
    """
    Groups scam messages using Jaccard shingle fingerprinting and shared infrastructure.
    Labels clusters strictly as POTENTIAL relationships rather than confirmed coordinated attacks.
    """
    if not messages:
        return CampaignClusteringResponse(
            total_messages_analyzed=0,
            total_clusters_formed=0,
            singleton_count=0,
            clusters=[]
        )

    # Prepare message representations
    records = []
    for idx, m in enumerate(messages):
        txt = m.get("text", "") or m.get("message_text", "")
        msg_id = str(m.get("id", f"msg-{idx+1}"))
        urls = extract_urls(txt)
        if m.get("url"):
            urls.append(m["url"])
        shingles = tokenize_and_shingle(txt)
        records.append({
            "id": msg_id,
            "text": txt,
            "sender": m.get("sender", "Unknown"),
            "target_brand": m.get("brand_name", "Unspecified"),
            "urls": list(set(urls)),
            "shingles": shingles,
            "created_at": m.get("created_at", "2026-10-12T12:00:00Z")
        })

    # Clustering via single-linkage agglomerative clustering with centroid assignment
    clusters_raw: List[List[Dict[str, Any]]] = []
    visited: Set[int] = set()

    for i in range(len(records)):
        if i in visited:
            continue
        current_cluster = [records[i]]
        visited.add(i)

        for j in range(i + 1, len(records)):
            if j in visited:
                continue
            
            sim = jaccard_similarity(records[i]["shingles"], records[j]["shingles"])
            # Shared URL boost
            shared_urls = set(records[i]["urls"]).intersection(set(records[j]["urls"]))
            if shared_urls:
                sim = max(sim, 0.85)

            if sim >= similarity_threshold:
                current_cluster.append(records[j])
                visited.add(j)

        clusters_raw.append(current_cluster)

    output_clusters: List[CampaignCluster] = []
    singletons = 0

    for c_idx, c_items in enumerate(clusters_raw):
        if len(c_items) == 1:
            singletons += 1
            # Still format if only single item or include in singleton count
            continue

        cluster_texts = [it["text"] for it in c_items]
        shared_phrases = extract_common_phrases(cluster_texts, min_count=2)
        
        all_urls: Set[str] = set()
        for it in c_items:
            all_urls.update(it["urls"])

        # Compute average pairwise similarity
        sim_scores = []
        for a_idx in range(len(c_items)):
            for b_idx in range(a_idx + 1, len(c_items)):
                sim_scores.append(jaccard_similarity(c_items[a_idx]["shingles"], c_items[b_idx]["shingles"]))
        avg_sim = sum(sim_scores) / len(sim_scores) if sim_scores else 0.80

        # Cluster risk level
        risk_level = "CRITICAL" if len(c_items) >= 4 or len(all_urls) >= 2 else "HIGH"

        cluster_models_items = []
        for it in c_items:
            cluster_models_items.append(CampaignClusterItem(
                message_id=it["id"],
                message_text=it["text"],
                sender=it["sender"],
                target_brand=it["target_brand"],
                similarity_to_centroid=round(avg_sim, 2),
                detected_urls=it["urls"],
                created_at=it["created_at"]
            ))

        primary_theme = shared_phrases[0] if shared_phrases else (c_items[0]["target_brand"] or "Phishing Vector")
        c_name = f"Cluster #{c_idx + 1}: {primary_theme.title()} Syndicate"

        output_clusters.append(CampaignCluster(
            cluster_id=f"cluster-{c_idx + 1}",
            cluster_name=c_name,
            size=len(c_items),
            shared_phrases=shared_phrases,
            shared_urls=list(all_urls),
            average_similarity_score=round(avg_sim, 2),
            risk_level=risk_level,
            relationship_disclaimer="POTENTIAL RELATIONSHIP: Grouped by statistical text fingerprint similarity. Coordinated infrastructure requires corroborated forensic proof.",
            items=cluster_models_items
        ))

    return CampaignClusteringResponse(
        total_messages_analyzed=len(messages),
        total_clusters_formed=len(output_clusters),
        singleton_count=singletons,
        clusters=output_clusters
    )
