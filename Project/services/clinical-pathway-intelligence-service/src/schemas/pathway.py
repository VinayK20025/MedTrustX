"""
MedTrustX Clinical Pathway Intelligence Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Pathways ──

class PathwayCreate(BaseModel):
    name: str
    description: Optional[str] = None


class PathwayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: Optional[str]
    created_at: datetime


# ── Journeys ──

class JourneyCreate(BaseModel):
    patient_id: uuid.UUID
    pathway_id: uuid.UUID


class JourneyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    pathway_id: uuid.UUID
    current_step: int
    status: str
    created_at: datetime


# ── Variances ──

class VarianceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    journey_id: uuid.UUID
    expected_step: int
    actual_step: int
    variance_reason: Optional[str]
    created_at: datetime
