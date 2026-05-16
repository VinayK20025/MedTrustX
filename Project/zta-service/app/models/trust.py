"""
Trust models.
"""
from typing import Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class AccessEvaluationRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    user_id: UUID
    device_id: UUID
    resource: str
    action: str
    tenant_id: UUID
    source_ip: Optional[str] = None

class TrustScoreResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    combined_score: float
    device_score: float
    user_score: float
    network_score: float
    recommendation: str

class AccessDecision(BaseModel):
    model_config = ConfigDict(strict=True)
    allow: bool
    trust_score: float
    step_up_required: bool
    reason: str
    policy_rule: str
