"""
MedTrustX Infection Control Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Infections ──────────────────────────────────────────────────
class InfectionCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    infection_type: str = Field(..., max_length=100)


class InfectionUpdate(BaseModel):
    status: str = Field(..., description="active | resolved | unverified")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"active", "resolved", "unverified"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class InfectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    infection_type: str
    status: str
    detected_at: datetime
    resolved_at: Optional[datetime] = None


# ── Infection Events ────────────────────────────────────────────
class InfectionEventCreate(BaseModel):
    event_type: str = Field(..., max_length=50)
    description: str


class InfectionEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    infection_id: uuid.UUID
    event_type: str
    description: str
    recorded_at: datetime


# ── Isolation Cases ─────────────────────────────────────────────
class IsolationCaseCreate(BaseModel):
    patient_id: uuid.UUID
    isolation_type: str = Field(..., max_length=50, description="contact | droplet | airborne | strict")


class IsolationCaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    isolation_type: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None


# ── Audits ──────────────────────────────────────────────────────
class InfectionAuditCreate(BaseModel):
    audit_type: str = Field(..., max_length=50)
    department: str = Field(..., max_length=100)
    score: int = Field(..., ge=0, le=100)


class InfectionAuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    audit_type: str
    department: str
    score: int
    conducted_at: datetime
    conducted_by: uuid.UUID


# ── Antimicrobial Resistance (AMR) ──────────────────────────────
class AMRCreate(BaseModel):
    patient_id: uuid.UUID
    organism: str = Field(..., max_length=100)
    drug: str = Field(..., max_length=100)
    resistance_level: str = Field(..., max_length=50, description="susceptible | intermediate | resistant")

    @field_validator("resistance_level")
    @classmethod
    def validate_resistance(cls, v: str) -> str:
        allowed = {"susceptible", "intermediate", "resistant"}
        if v.lower() not in allowed:
            raise ValueError(f"resistance_level must be one of {allowed}")
        return v.lower()


class AMRResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    organism: str
    drug: str
    resistance_level: str
    recorded_at: datetime
