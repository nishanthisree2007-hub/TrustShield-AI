from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ConfusionMatrix(BaseModel):
    true_positive: int
    false_positive: int
    true_negative: int
    false_negative: int

class DatasetBreakdown(BaseModel):
    total_samples: int
    scam_text_samples: int
    impersonation_profile_samples: int
    malicious_app_samples: int
    benign_control_samples: int

class BenchmarkItemResult(BaseModel):
    sample_id: str
    sample_name: str
    sample_type: str
    ground_truth: str  # THREAT, BENIGN
    predicted_result: str  # THREAT, BENIGN
    predicted_score: float
    is_correct: bool
    explanation: str

class DetectionQualityReport(BaseModel):
    dataset_breakdown: DatasetBreakdown
    confusion_matrix: ConfusionMatrix
    precision: float
    recall: float
    f1_score: float
    false_positive_rate: float
    false_negative_rate: float
    accuracy: float
    auc_roc_estimate: float
    evaluation_notes: str
    detailed_benchmarks: List[BenchmarkItemResult]
