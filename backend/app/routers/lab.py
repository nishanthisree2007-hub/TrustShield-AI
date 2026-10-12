from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.quality import DetectionQualityReport
from app.services.detection_lab import run_detection_quality_evaluation
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/lab", tags=["Detection Quality Lab"])

@router.get("/evaluate", response_model=DetectionQualityReport)
def get_detection_quality_report(current_user: User = Depends(get_current_user)):
    return run_detection_quality_evaluation()
