from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class DigitalTwinScenario(Base):
    __tablename__ = "digital_twin_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    name = Column(String(200), nullable=False)
    scenario_type = Column(String(50), nullable=False)  # typosquatting, handle_spoof, fake_giveaway, fake_support, malicious_app
    payload = Column(Text, nullable=False)  # JSON representation of simulated threat
    expected_risk = Column(String(30), nullable=False)  # HIGH, CRITICAL, MEDIUM, LOW
    detected_score = Column(Float, default=0.0)
    detected_category = Column(String(30), default="LOW")
    passed = Column(Boolean, default=True)  # True if detection correctly flagged threat
    simulation_notes = Column(Text, nullable=True)
    is_synthetic = Column(Boolean, default=True)  # Always True
    created_at = Column(DateTime, default=datetime.utcnow)

    brand = relationship("Brand", backref="twin_scenarios")
