from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class CampaignClusterItem(BaseModel):
    message_id: str
    message_text: str
    sender: Optional[str] = None
    target_brand: Optional[str] = None
    similarity_to_centroid: float
    detected_urls: List[str] = []
    created_at: str

class CampaignCluster(BaseModel):
    cluster_id: str
    cluster_name: str
    size: int
    shared_phrases: List[str]
    shared_urls: List[str]
    average_similarity_score: float
    risk_level: str
    relationship_disclaimer: str = "POTENTIAL RELATIONSHIP: Grouped by statistical text fingerprint similarity. Coordinated infrastructure requires corroborated forensic proof."
    items: List[CampaignClusterItem]

class CampaignClusteringResponse(BaseModel):
    total_messages_analyzed: int
    total_clusters_formed: int
    singleton_count: int
    clusters: List[CampaignCluster]
