from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class DigitalTwinRunRequest(BaseModel):
    brand_id: int
    custom_scenarios_count: Optional[int] = 10
    include_typosquatting: bool = True
    include_social_spoof: bool = True
    include_fake_promos: bool = True
    include_malicious_apps: bool = True

class SimulatedScenarioResult(BaseModel):
    scenario_id: str
    scenario_name: str
    scenario_type: str
    synthetic_payload: Dict[str, Any]
    expected_risk: str
    detected_score: float
    detected_category: str
    passed: bool
    is_false_positive: bool
    is_false_negative: bool
    mitigation_recommendation: str

class DigitalTwinRunResponse(BaseModel):
    brand_id: int
    brand_name: str
    total_scenarios_tested: int
    scenarios_detected: int
    false_positives: int
    false_negatives: int
    precision: float
    recall: float
    f1_score: float
    brand_resilience_score: float  # 0 to 100
    synthetic_label_warning: str = "SYNTHETIC DEFENSIVE SIMULATION: All test vectors are generated for security posture evaluation and not deployed live."
    scenario_results: List[SimulatedScenarioResult]
