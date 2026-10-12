from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    entity_type = Column(String(50), nullable=False)  # profile, scam_message, mobile_app, domain
    entity_identifier = Column(String(255), nullable=False)  # e.g. @fakename, url, package_id
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True)
    
    risk_score = Column(Float, default=0.0)  # 0.0 to 100.0
    risk_category = Column(String(30), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="OPEN")  # OPEN, UNDER_REVIEW, RESOLVED, FALSE_POSITIVE
    
    # JSON-encoded fields
    warning_signals = Column(Text, default="[]")
    contributing_factors = Column(Text, default="{}")  # weights breakdown
    evidence_summary = Column(Text, default="{}")
    missing_data = Column(Text, default="[]")
    confidence_limitations = Column(Text, default="[]")
    recommended_actions = Column(Text, default="[]")
    analyst_notes = Column(Text, default="")
    
    is_false_positive = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    brand = relationship("Brand", backref="investigations")
