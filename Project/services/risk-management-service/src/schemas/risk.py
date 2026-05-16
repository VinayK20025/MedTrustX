"""
MedTrustX Risk Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Risks ──

class RiskCreate(BaseModel):
    risk_type: str
    description: str
    likelihood: int
    impact: int


class RiskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    risk_type: str
    description: str
    likelihood: int
    impact: int
    score: int
    status: str
    created_at: datetime


# ── Risk Assessments ──

class RiskAssessmentCreate(BaseModel):
    assessed_by: uuid.UUID
    score: int


class RiskAssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    risk_id: uuid.UUID
    assessed_by: uuid.UUID
    score: int
    assessed_at: datetime


# ── Mitigation Plans ──

class MitigationPlanCreate(BaseModel):
    risk_id: uuid.UUID
    actions: List[Dict[str, Any]]


class MitigationPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    risk_id: uuid.UUID
    actions: List[Dict[str, Any]]
    status: str
    created_at: datetime


# ── Risk Indicators ──

class RiskIndicatorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    indicator_name: str
    value: float
    threshold: float
    recorded_at: datetime
