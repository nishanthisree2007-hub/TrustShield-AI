import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")
    
    APP_NAME: str = "TrustShield AI"
    APP_VERSION: str = "1.0.0"
    TAGLINE: str = "Detect the Fake. Protect the Brand. Stop the Threat."
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    SECRET_KEY: str = "trustshield-ai-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    DATABASE_URL: str = "sqlite:///./trustshield.db"
    
    # Optional LLM API keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # Explainable Risk Engine Weights (must sum to 1.0)
    RISK_WEIGHT_BRAND_SIMILARITY: float = 0.20
    RISK_WEIGHT_LOGO_SIMILARITY: float = 0.20
    RISK_WEIGHT_SUSPICIOUS_URL: float = 0.25
    RISK_WEIGHT_SCAM_CONTENT: float = 0.20
    RISK_WEIGHT_ACCOUNT_METADATA: float = 0.15
    
    # Upload limits
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024  # 5MB
    UPLOAD_DIR: str = "./vault_evidence"
    
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
