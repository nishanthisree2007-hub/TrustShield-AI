from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from app.database import Base

class ThreatNode(Base):
    __tablename__ = "threat_nodes"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String(100), unique=True, index=True, nullable=False)
    label = Column(String(200), nullable=False)
    node_type = Column(String(50), nullable=False)  # brand, profile, url, scam_message, mobile_app, cluster
    risk_level = Column(String(30), default="LOW")
    risk_score = Column(Float, default=0.0)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

class ThreatEdge(Base):
    __tablename__ = "threat_edges"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(100), nullable=False, index=True)
    target_id = Column(String(100), nullable=False, index=True)
    relationship_type = Column(String(50), nullable=False)  # IMPERSONATES, HOSTS_LINK, USES_PHONE, SPREADS_SCAM, MEMBER_OF_CLUSTER
    evidence_rationale = Column(Text, nullable=False)  # Explicit justification
    weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
