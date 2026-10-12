import json
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.models.brand import Brand
from app.models.investigation import Investigation
from app.models.threat_node import ThreatNode, ThreatEdge
from app.schemas.graph import CytoscapeNode, CytoscapeNodeData, CytoscapeEdge, CytoscapeEdgeData, ThreatGraphResponse

def generate_threat_relationship_graph(db: Session, filter_brand_id: Optional[int] = None) -> ThreatGraphResponse:
    """
    Constructs a Cytoscape.js compatible graph linking Brands, Suspicious Profiles, URLs, Scam Messages, and Mobile Apps.
    Edges are only generated when verifiable relationship evidence exists.
    """
    nodes: Dict[str, CytoscapeNode] = {}
    edges: Dict[str, CytoscapeEdge] = {}

    brands_query = db.query(Brand)
    if filter_brand_id:
        brands_query = brands_query.filter(Brand.id == filter_brand_id)
    brands = brands_query.all()

    for b in brands:
        b_node_id = f"brand_{b.id}"
        nodes[b_node_id] = CytoscapeNode(
            data=CytoscapeNodeData(
                id=b_node_id,
                label=b.name,
                type="brand",
                risk_level="SAFE",
                risk_score=0.0,
                metadata={
                    "official_website": b.official_website,
                    "approved_handles": json.loads(b.approved_handles or "[]"),
                    "support_channels": json.loads(b.support_channels or "[]")
                }
            )
        )

    investigations_query = db.query(Investigation)
    if filter_brand_id:
        investigations_query = investigations_query.filter(Investigation.brand_id == filter_brand_id)
    investigations = investigations_query.all()

    for inv in investigations:
        inv_node_id = f"inv_{inv.id}"
        evidence_summary = json.loads(inv.evidence_summary or "{}")
        warning_signals = json.loads(inv.warning_signals or "[]")

        nodes[inv_node_id] = CytoscapeNode(
            data=CytoscapeNodeData(
                id=inv_node_id,
                label=inv.title[:28] + ("..." if len(inv.title) > 28 else ""),
                type=inv.entity_type,  # profile, scam_message, mobile_app, domain
                risk_level=inv.risk_category,
                risk_score=inv.risk_score,
                metadata={
                    "investigation_id": inv.id,
                    "status": inv.status,
                    "entity_identifier": inv.entity_identifier,
                    "warning_signals": warning_signals,
                    "created_at": inv.created_at.isoformat()
                }
            )
        )

        # Connect entity to Brand if brand_id exists
        if inv.brand_id and f"brand_{inv.brand_id}" in nodes:
            edge_id = f"edge_{inv_node_id}_to_brand_{inv.brand_id}"
            
            if inv.entity_type == "profile":
                rel = "IMPERSONATES"
                rationale = f"Profile '{inv.entity_identifier}' exhibits high lexical/visual similarity ({round(inv.risk_score, 1)}% risk) to legitimate brand."
            elif inv.entity_type == "scam_message":
                rel = "TARGETS_CUSTOMERS_OF"
                rationale = f"Scam communication cites brand name to deceive recipients into payment/credential disclosure."
            elif inv.entity_type == "mobile_app":
                rel = "SQUATS_PACKAGE_NAMESPACE"
                rationale = f"Mobile application claims affiliation with brand '{inv.brand.name if inv.brand else ''}' with unverified developer credentials."
            else:
                rel = "ASSOCIATED_WITH"
                rationale = f"Digital threat vector directly mimics brand digital identity."

            edges[edge_id] = CytoscapeEdge(
                data=CytoscapeEdgeData(
                    id=edge_id,
                    source=inv_node_id,
                    target=f"brand_{inv.brand_id}",
                    relationship=rel,
                    rationale=rationale,
                    weight=round(inv.risk_score / 100.0, 2)
                )
            )

        # Extract embedded URLs as separate nodes to show shared infrastructure
        target_url = evidence_summary.get("url") or evidence_summary.get("associated_url")
        if target_url:
            url_node_id = f"url_{hash(target_url) % 1000000}"
            if url_node_id not in nodes:
                nodes[url_node_id] = CytoscapeNode(
                    data=CytoscapeNodeData(
                        id=url_node_id,
                        label=target_url.replace("https://", "").replace("http://", "")[:24],
                        type="url",
                        risk_level="HIGH" if inv.risk_score > 60 else "MEDIUM",
                        risk_score=inv.risk_score,
                        metadata={"full_url": target_url}
                    )
                )
            url_edge_id = f"edge_{inv_node_id}_hosts_{url_node_id}"
            edges[url_edge_id] = CytoscapeEdge(
                data=CytoscapeEdgeData(
                    id=url_edge_id,
                    source=inv_node_id,
                    target=url_node_id,
                    relationship="HOSTS_DECEPTIVE_LINK",
                    rationale=f"Investigation record contains phishing/scam hyperlink destination '{target_url}'",
                    weight=0.9
                )
            )

    return ThreatGraphResponse(
        nodes=list(nodes.values()),
        edges=list(edges.values()),
        total_nodes=len(nodes),
        total_edges=len(edges),
        active_threat_clusters=len([n for n in nodes.values() if n.data.risk_level in ("HIGH", "CRITICAL")])
    )
