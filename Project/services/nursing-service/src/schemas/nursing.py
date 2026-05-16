"""
MedTrustX Nursing Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Nursing Tasks ───────────────────────────────────────────────
class NursingTaskCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    task_type: str = Field(..., max_length=50, description="vitals | medication | procedure | hygiene")
    description: str
    assigned_to: Optional[uuid.UUID] = None
    due_time: datetime

    @field_validator("task_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"vitals", "medication", "procedure", "hygiene"}
        if v.lower() not in allowed:
            raise ValueError(f"task_type must be one of {allowed}")
        return v.lower()


class NursingTaskUpdate(BaseModel):
    status: Optional[str] = Field(None, description="pending | in_progress | completed | missed")
    assigned_to: Optional[uuid.UUID] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"pending", "in_progress", "completed", "missed"}
            if v.lower() not in allowed:
                raise ValueError(f"status must be one of {allowed}")
            return v.lower()
        return v


class NursingTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    task_type: str
    description: str
    assigned_to: Optional[uuid.UUID] = None
    status: str
    due_time: datetime
    completed_at: Optional[datetime] = None
    completed_by: Optional[uuid.UUID] = None
    created_at: datetime


# ── Nursing Notes ───────────────────────────────────────────────
class NursingNoteCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    note: str


class NursingNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    note: str
    created_by: uuid.UUID
    created_at: datetime


# ── Vitals ──────────────────────────────────────────────────────
class VitalsCreate(BaseModel):
    type: str = Field(..., max_length=50)
    value: str = Field(..., max_length=50)
    unit: Optional[str] = Field(None, max_length=20)


class VitalsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    type: str
    value: str
    unit: Optional[str] = None
    recorded_by: uuid.UUID
    recorded_at: datetime


# ── Shift Handovers ─────────────────────────────────────────────
class ShiftHandoverCreate(BaseModel):
    shift_start: datetime
    shift_end: datetime
    notes: str


class ShiftHandoverResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    nurse_id: uuid.UUID
    shift_start: datetime
    shift_end: datetime
    notes: str
    created_at: datetime
