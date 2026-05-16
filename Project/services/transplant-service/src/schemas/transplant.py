"""
MedTrustX Transplant Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

# ── Donors ──
class DonorCreate(BaseModel):
    donor_type: str
    blood_group: str
    organ_type: str
    eligibility_status: str

class DonorUpdate(BaseModel):
    eligibility_status: Optional[str] = None

class DonorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    donor_type: str
    blood_group: str
    organ_type: str
    eligibility_status: str
    registered_at: datetime
    updated_at: datetime

# ── Recipients ──
class RecipientCreate(BaseModel):
    patient_id: uuid.UUID
    organ_needed: str
    blood_group: str
    urgency_level: str

class RecipientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    patient_id: uuid.UUID
    organ_needed: str
    blood_group: str
    urgency_level: str
    status: str
    listed_at: datetime

# ── Waitlists ──
class WaitlistCreate(BaseModel):
    organ_type: str
    recipient_id: uuid.UUID
    priority_score: int

class WaitlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    organ_type: str
    recipient_id: uuid.UUID
    priority_score: int
    status: str
    updated_at: datetime

# ── Matches ──
class MatchCreate(BaseModel):
    donor_id: uuid.UUID
    recipient_id: uuid.UUID
    compatibility_score: int

class MatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    donor_id: uuid.UUID
    recipient_id: uuid.UUID
    compatibility_score: int
    status: str
    matched_at: datetime

# ── Transplants ──
class TransplantCreate(BaseModel):
    donor_id: uuid.UUID
    recipient_id: uuid.UUID
    surgery_id: uuid.UUID

class TransplantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    donor_id: uuid.UUID
    recipient_id: uuid.UUID
    surgery_id: uuid.UUID
    status: str
    performed_at: Optional[datetime]
