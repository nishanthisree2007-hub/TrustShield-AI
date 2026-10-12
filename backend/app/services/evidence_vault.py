import os
import hashlib
import json
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.orm import Session
from app.config import settings
from app.models.evidence import Evidence
from app.models.investigation import Investigation

ALLOWED_MIME_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "text/plain": ".txt",
    "application/json": ".json"
}

def ensure_vault_dir():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

def compute_sha256(data_bytes: bytes) -> str:
    return hashlib.sha256(data_bytes).hexdigest()

def store_evidence_file(
    db: Session,
    investigation_id: Optional[int],
    title: str,
    file_bytes: bytes,
    original_filename: str,
    mime_type: str,
    description: str,
    raw_payload: Optional[Dict[str, Any]] = None
) -> Tuple[bool, str, Optional[Evidence]]:
    """
    Validates, computes SHA-256 integrity hash, and securely stores evidence artifacts.
    Enforces file size restrictions and prevents file execution.
    """
    if len(file_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
        return False, f"File size exceeds maximum threshold of {settings.MAX_UPLOAD_SIZE_BYTES / (1024*1024)}MB", None

    # Validate mime
    clean_mime = mime_type.lower().split(';')[0].strip()
    if clean_mime not in ALLOWED_MIME_TYPES and not original_filename.endswith((".txt", ".json", ".log", ".png", ".jpg", ".jpeg")):
        return False, f"Unsupported MIME type '{clean_mime}'. Safe storage restricted to static images and text logs.", None

    ensure_vault_dir()
    file_hash = compute_sha256(file_bytes)
    
    ext = ALLOWED_MIME_TYPES.get(clean_mime, ".bin")
    safe_stored_filename = f"ev_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file_hash[:12]}{ext}"
    safe_path = os.path.join(settings.UPLOAD_DIR, safe_stored_filename)

    # Secure write (no execute permissions)
    with open(safe_path, "wb") as f:
        f.write(file_bytes)

    evidence_record = Evidence(
        investigation_id=investigation_id,
        title=title,
        evidence_type="file_upload" if original_filename else "data_snapshot",
        file_name=original_filename or safe_stored_filename,
        file_path=safe_path,
        file_size=len(file_bytes),
        mime_type=clean_mime,
        sha256_hash=file_hash,
        description=description,
        raw_payload=json.dumps(raw_payload or {})
    )
    db.add(evidence_record)
    db.commit()
    db.refresh(evidence_record)

    return True, "Evidence securely archived and cryptographically hashed.", evidence_record
