from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base

class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    alt_names = Column(Text, default="[]")  # JSON list of strings
    official_website = Column(String(255), nullable=False)
    approved_handles = Column(Text, default="[]")  # JSON list of handles like ["@trustshield", "@trustshield_official"]
    logo_hash = Column(String(64), nullable=True)  # SHA-256 or perceptual hash of official logo
    logo_url = Column(String(500), nullable=True)
    support_channels = Column(Text, default="[]")  # JSON list of approved support emails / phone numbers / handles
    known_keywords = Column(Text, default="[]")  # JSON list of official brand keywords
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
