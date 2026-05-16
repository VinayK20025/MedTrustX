"""
MedTrustX Population Health Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, ConfigDict


# ── Populations ──

class PopulationCreateRequest(BaseModel):
    name: str
    criteria: Dict[str, Any] = {}


class PopulationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    criteria: Dict[str, Any]


# ── Members ──

class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    population_id: uuid.UUID
    patient_id: uuid.UUID
    risk_score: float
    assigned_at: datetime


# ── Risk Profiles ──

class RiskProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    risk_type: str
    risk_score: float
    calculated_at: datetime
    factors: Dict[str, Any]


# ── Care Gaps ──

class CareGapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    gap_type: str
    status: str
    identified_at: datetime
    details: Dict[str, Any]


# ── Interventions ──

class InterventionCreateRequest(BaseModel):
    population_id: uuid.UUID
    intervention_type: str
    config: Dict[str, Any] = {}


class InterventionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    population_id: uuid.UUID
    intervention_type: str
    status: str
    config: Dict[str, Any]
