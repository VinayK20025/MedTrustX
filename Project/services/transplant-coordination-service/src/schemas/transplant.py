"""
MedTrustX Transplant Coordination Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Donors ──

class DonorCreate(BaseModel):
    donor_type: str
    blood_group: str


class DonorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    donor_type: str
    blood_group: str
    status: str
    registered_at: datetime


# ── Recipients ──

class RecipientCreate(BaseModel):
    patient_id: uuid.UUID
    organ_needed: str
    priority: int = 1


class RecipientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    organ_needed: str
    priority: int
    status: str
    registered_at: datetime


# ── Waitlists ──

class WaitlistCreate(BaseModel):
    recipient_id: uuid.UUID
    position: int


class WaitlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    recipient_id: uuid.UUID
    position: int
    status: str
    updated_at: datetime


# ── Matches ──

class MatchCreate(BaseModel):
    donor_id: uuid.UUID
    recipient_id: uuid.UUID
    match_score: float


class MatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    donor_id: uuid.UUID
    recipient_id: uuid.UUID
    match_score: float
    status: str
    created_at: datetime


# ── Transplant Events ──

class TransplantEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
