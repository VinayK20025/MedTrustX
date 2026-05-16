"""
Risk Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class RiskCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    title: str
    description: str
    framework_refs: List[str]
    category: str
    likelihood: int
    impact: int
    control_effectiveness: float
    risk_owner: str
    treatment: str
    mitigation_plan: str
    target_date: Optional[datetime]

class RiskResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    id: UUID
    tenant_id: UUID
    title: str
    description: str
    framework_refs: List[str]
    category: str
    likelihood: int
    impact: int
    inherent_risk_score: int
    control_effectiveness: float
    residual_risk_score: float
    risk_owner: str
    treatment: str
    mitigation_plan: str
    target_date: Optional[datetime]
    status: str
    review_date: Optional[datetime]
