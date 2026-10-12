import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.brand import Brand
from app.models.user import User
from app.schemas.brand import BrandCreate, BrandUpdate, BrandResponse, BrandSimilarityAnalysis
from app.services.brand_dna import compare_brand_dna
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/brands", tags=["Brands"])

def format_brand_response(brand: Brand) -> dict:
    return {
        "id": brand.id,
        "name": brand.name,
        "alt_names": json.loads(brand.alt_names or "[]"),
        "official_website": brand.official_website,
        "approved_handles": json.loads(brand.approved_handles or "[]"),
        "logo_hash": brand.logo_hash,
        "logo_url": brand.logo_url,
        "support_channels": json.loads(brand.support_channels or "[]"),
        "known_keywords": json.loads(brand.known_keywords or "[]"),
        "description": brand.description,
        "created_at": brand.created_at,
        "updated_at": brand.updated_at
    }

@router.get("", response_model=List[BrandResponse])
def list_brands(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    brands = db.query(Brand).order_by(Brand.created_at.desc()).all()
    return [format_brand_response(b) for b in brands]

@router.post("", response_model=BrandResponse)
def create_brand(brand_in: BrandCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Brand).filter(Brand.name.ilike(brand_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Brand with name '{brand_in.name}' already registered.")

    new_brand = Brand(
        name=brand_in.name,
        alt_names=json.dumps(brand_in.alt_names),
        official_website=brand_in.official_website,
        approved_handles=json.dumps(brand_in.approved_handles),
        logo_hash=brand_in.logo_hash,
        logo_url=brand_in.logo_url,
        support_channels=json.dumps(brand_in.support_channels),
        known_keywords=json.dumps(brand_in.known_keywords),
        description=brand_in.description
    )
    db.add(new_brand)
    db.commit()
    db.refresh(new_brand)
    return format_brand_response(new_brand)

@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(brand_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return format_brand_response(brand)

@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(brand_id: int, brand_in: BrandUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    if brand_in.name is not None:
        brand.name = brand_in.name
    if brand_in.alt_names is not None:
        brand.alt_names = json.dumps(brand_in.alt_names)
    if brand_in.official_website is not None:
        brand.official_website = brand_in.official_website
    if brand_in.approved_handles is not None:
        brand.approved_handles = json.dumps(brand_in.approved_handles)
    if brand_in.logo_hash is not None:
        brand.logo_hash = brand_in.logo_hash
    if brand_in.logo_url is not None:
        brand.logo_url = brand_in.logo_url
    if brand_in.support_channels is not None:
        brand.support_channels = json.dumps(brand_in.support_channels)
    if brand_in.known_keywords is not None:
        brand.known_keywords = json.dumps(brand_in.known_keywords)
    if brand_in.description is not None:
        brand.description = brand_in.description

    db.commit()
    db.refresh(brand)
    return format_brand_response(brand)

@router.delete("/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    db.delete(brand)
    db.commit()
    return {"status": "success", "message": f"Brand '{brand.name}' deleted successfully"}

@router.post("/{brand_id}/compare", response_model=BrandSimilarityAnalysis)
def compare_brand_identity(
    brand_id: int,
    submitted_name: str,
    submitted_handle: str,
    submitted_url: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    res = compare_brand_dna(
        submitted_name=submitted_name,
        submitted_handle=submitted_handle,
        submitted_url=submitted_url,
        brand_name=brand.name,
        brand_alt_names=json.loads(brand.alt_names or "[]"),
        brand_website=brand.official_website,
        approved_handles=json.loads(brand.approved_handles or "[]"),
        known_keywords=json.loads(brand.known_keywords or "[]"),
        brand_logo_hash=brand.logo_hash
    )

    return BrandSimilarityAnalysis(
        brand_id=brand.id,
        brand_name=brand.name,
        name_similarity_score=res["name_similarity_score"],
        username_similarity_score=res["username_similarity_score"],
        domain_similarity_score=res["domain_similarity_score"],
        logo_similarity_score=res["logo_similarity_score"],
        overall_similarity_score=res["overall_similarity_score"],
        evidence_breakdown=res["evidence_breakdown"],
        is_impersonation_candidate=res["is_impersonation_candidate"],
        risk_level=res["risk_level"]
    )
