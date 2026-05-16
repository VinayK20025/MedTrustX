"""
MedTrustX Enterprise Risk Oversight Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict

class RiskCreate(BaseModel):
    category: str
    description: str
    severity: str

class RiskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    category: str
    description: str
    severity: str
    status: str
    created_at: datetime

class AssessmentCreate(BaseModel):
    risk_id: uuid.UUID
    score: float
    likelihood: float
    impact: float

class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    risk_id: uuid.UUID
    score: float
    likelihood: float
    impact: float
    assessed_at: datetime

class MitigationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    risk_id: uuid.UUID
    actions: Dict[str, Any]
    status: str
    created_at: datetime

class RiskEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    risk_id: uuid.UUID
    event_type: str
    details: Dict[str, Any]
    created_at: datetime
