import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.evidence import Evidence
from app.models.investigation import Investigation
from app.models.user import User
from app.services.evidence_vault import store_evidence_file
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/vault", tags=["Evidence Vault"])

def format_evidence_record(ev: Evidence) -> dict:
    return {
        "id": ev.id,
        "investigation_id": ev.investigation_id,
        "title": ev.title,
        "evidence_type": ev.evidence_type,
        "file_name": ev.file_name,
        "file_size": ev.file_size,
        "mime_type": ev.mime_type,
        "sha256_hash": ev.sha256_hash,
        "description": ev.description,
        "raw_payload": json.loads(ev.raw_payload or "{}"),
        "created_at": ev.created_at
    }

@router.get("")
def list_evidence(
    investigation_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Evidence).order_by(Evidence.created_at.desc())
    if investigation_id:
        query = query.filter(Evidence.investigation_id == investigation_id)
    records = query.all()
    return [format_evidence_record(r) for r in records]

@router.post("/upload")
async def upload_evidence(
    title: str = Form(...),
    description: Optional[str] = Form(""),
    investigation_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    success, msg, ev_record = store_evidence_file(
        db=db,
        investigation_id=investigation_id,
        title=title,
        file_bytes=contents,
        original_filename=file.filename or "uploaded_evidence.txt",
        mime_type=file.content_type or "text/plain",
        description=description or "",
        raw_payload={"uploaded_by": current_user.username}
    )

    if not success:
        raise HTTPException(status_code=400, detail=msg)

    return {
        "status": "success",
        "message": msg,
        "evidence": format_evidence_record(ev_record)
    }

@router.get("/{ev_id}")
def get_evidence(
    ev_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ev = db.query(Evidence).filter(Evidence.id == ev_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence artifact not found")
    return format_evidence_record(ev)

@router.delete("/{ev_id}")
def delete_evidence(
    ev_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ev = db.query(Evidence).filter(Evidence.id == ev_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence artifact not found")
    db.delete(ev)
    db.commit()
    return {"status": "success", "message": "Evidence record removed"}
