from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class CytoscapeNodeData(BaseModel):
    id: str
    label: str
    type: str  # brand, profile, url, scam_message, mobile_app, cluster
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL, SAFE
    risk_score: float
    metadata: Dict[str, Any] = {}

class CytoscapeNode(BaseModel):
    data: CytoscapeNodeData

class CytoscapeEdgeData(BaseModel):
    id: str
    source: str
    target: str
    relationship: str  # IMPERSONATES, HOSTS_LINK, USES_PHONE, SPREADS_SCAM, MEMBER_OF_CLUSTER, ASSOCIATED_WITH
    rationale: str  # Evidence justification
    weight: float = 1.0

class CytoscapeEdge(BaseModel):
    data: CytoscapeEdgeData

class ThreatGraphResponse(BaseModel):
    nodes: List[CytoscapeNode]
    edges: List[CytoscapeEdge]
    total_nodes: int
    total_edges: int
    active_threat_clusters: int
