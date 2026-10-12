from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id"), nullable=True)
    title = Column(String(200), nullable=False)
    evidence_type = Column(String(50), nullable=False)  # screenshot, raw_text, url_metadata, cert_data, hash
    file_name = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), default="text/plain")
    sha256_hash = Column(String(64), nullable=False)
    description = Column(Text, nullable=True)
    raw_payload = Column(Text, default="{}")  # Raw metadata/JSON snapshot
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", backref="evidence_records")
