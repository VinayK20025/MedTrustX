"""
MedTrustX Blood Bank Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Donors ──────────────────────────────────────────────────────
class DonorCreate(BaseModel):
    name: str = Field(..., max_length=100)
    blood_group: str = Field(..., max_length=5)
    eligibility_status: str = Field("eligible", description="eligible | deferred | banned")

    @field_validator("eligibility_status")
    @classmethod
    def validate_eligibility(cls, v: str) -> str:
        allowed = {"eligible", "deferred", "banned"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class DonorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    blood_group: str
    eligibility_status: str
    last_donation_date: Optional[datetime] = None


# ── Blood Units ─────────────────────────────────────────────────
class BloodUnitCreate(BaseModel):
    donor_id: Optional[uuid.UUID] = None
    blood_group: str = Field(..., max_length=5)
    component: str = Field(..., max_length=20, description="RBC | Plasma | Platelets")
    collected_at: datetime
    expiry_date: datetime


class BloodUnitUpdate(BaseModel):
    status: str = Field(..., description="available | reserved | used | expired | discarded")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"available", "reserved", "used", "expired", "discarded"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class BloodUnitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    donor_id: Optional[uuid.UUID] = None
    blood_group: str
    component: str
    status: str
    collected_at: datetime
    expiry_date: datetime


# ── Crossmatches ────────────────────────────────────────────────
class CrossmatchCreate(BaseModel):
    patient_id: uuid.UUID
    blood_unit_id: uuid.UUID
    compatibility_status: str = Field(..., description="compatible | incompatible | indeterminate")

    @field_validator("compatibility_status")
    @classmethod
    def validate_compatibility(cls, v: str) -> str:
        allowed = {"compatible", "incompatible", "indeterminate"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class CrossmatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    blood_unit_id: uuid.UUID
    compatibility_status: str
    tested_at: datetime
    tested_by: uuid.UUID


# ── Transfusions ────────────────────────────────────────────────
class TransfusionCreate(BaseModel):
    patient_id: uuid.UUID
    blood_unit_id: uuid.UUID
    notes: Optional[str] = None


class TransfusionUpdate(BaseModel):
    status: str = Field(..., description="ongoing | completed | reaction")
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"ongoing", "completed", "reaction"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class TransfusionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    blood_unit_id: uuid.UUID
    administered_by: uuid.UUID
    administered_at: datetime
    status: str
    notes: Optional[str] = None
