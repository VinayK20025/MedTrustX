"""
MedTrustX OT Management Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── OT Rooms ────────────────────────────────────────────────────
class OTRoomCreate(BaseModel):
    name: str = Field(..., max_length=50)


class OTRoomUpdate(BaseModel):
    status: str = Field(..., description="available | occupied | maintenance")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"available", "occupied", "maintenance"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class OTRoomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    status: str


# ── Surgeries ───────────────────────────────────────────────────
class SurgeryCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    procedure_name: str = Field(..., max_length=100)
    scheduled_start: datetime
    scheduled_end: datetime


class SurgeryUpdate(BaseModel):
    status: Optional[str] = Field(None, description="scheduled | in_progress | completed | cancelled")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"scheduled", "in_progress", "completed", "cancelled"}
            if v.lower() not in allowed:
                raise ValueError(f"status must be one of {allowed}")
            return v.lower()
        return v


class SurgeryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    procedure_name: str
    status: str
    scheduled_start: datetime
    scheduled_end: datetime
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None


# ── OT Bookings ─────────────────────────────────────────────────
class OTBookingCreate(BaseModel):
    surgery_id: uuid.UUID
    ot_room_id: uuid.UUID
    booking_start: datetime
    booking_end: datetime


class OTBookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    surgery_id: uuid.UUID
    ot_room_id: uuid.UUID
    booking_start: datetime
    booking_end: datetime


# ── Surgical Teams ──────────────────────────────────────────────
class SurgicalTeamCreate(BaseModel):
    role: str = Field(..., max_length=50, description="surgeon | anesthetist | nurse")
    staff_id: uuid.UUID


class SurgicalTeamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    surgery_id: uuid.UUID
    role: str
    staff_id: uuid.UUID
