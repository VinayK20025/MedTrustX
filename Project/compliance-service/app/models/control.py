"""
Control Model.
"""
from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class FrameworkControl(BaseModel):
    model_config = ConfigDict(strict=True)
    control_id: str
    framework: str
    category: str
    title: str
    description: str
    requirement: str
    implementation: str
    evidence_source: str
    automated: bool
    severity: str

class ControlMappingResult(BaseModel):
    model_config = ConfigDict(strict=True)
    satisfied_controls: List[FrameworkControl]
    violated_controls: List[FrameworkControl]
    framework_scores: Dict[str, float]

class ComplianceScorecard(BaseModel):
    model_config = ConfigDict(strict=True)
    tenant_id: str
    scores: Dict[str, float]
    timestamp: str
