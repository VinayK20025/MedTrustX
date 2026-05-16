"""
MedTrustX Appointments Service — Pydantic Schemas
"""
import uuid
from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Schedules ───────────────────────────────────────────────────
class ScheduleCreate(BaseModel):
    doctor_id: uuid.UUID
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: time
    end_time: time
    slot_duration: int = Field(..., gt=0, description="Duration in minutes")


class ScheduleUpdate(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration: Optional[int] = Field(None, gt=0)


class ScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    doctor_id: uuid.UUID
    day_of_week: int
    start_time: time
    end_time: time
    slot_duration: int
    created_at: datetime


# ── Slots ───────────────────────────────────────────────────────
class SlotCreate(BaseModel):
    schedule_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    status: str = "available"


class SlotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    schedule_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    status: str


# ── Appointments ────────────────────────────────────────────────
class AppointmentCreate(BaseModel):
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    slot_id: uuid.UUID
    reason: Optional[str] = None


class AppointmentUpdate(BaseModel):
    status: str = Field(..., description="scheduled | checked_in | completed | cancelled | no_show")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"scheduled", "checked_in", "completed", "cancelled", "no_show"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    slot_id: uuid.UUID
    status: str
    reason: Optional[str]
    created_at: datetime
    updated_at: datetime


# ── Queues ──────────────────────────────────────────────────────
class QueueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    appointment_id: uuid.UUID
    queue_position: int
    status: str
    updated_at: datetime
