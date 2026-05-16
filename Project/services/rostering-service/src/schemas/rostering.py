"""
MedTrustX Rostering Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Schedules ──

class ScheduleCreate(BaseModel):
    department: str
    start_date: datetime
    end_date: datetime


class ScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    department: str
    start_date: datetime
    end_date: datetime
    created_at: datetime


# ── Shifts ──

class ShiftCreate(BaseModel):
    schedule_id: uuid.UUID
    shift_type: str
    start_time: datetime
    end_time: datetime


class ShiftResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    schedule_id: uuid.UUID
    shift_type: str
    start_time: datetime
    end_time: datetime


# ── Assignments ──

class AssignmentCreate(BaseModel):
    shift_id: uuid.UUID
    user_id: uuid.UUID


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    shift_id: uuid.UUID
    user_id: uuid.UUID
    assigned_at: datetime


# ── Availability ──

class AvailabilityCreate(BaseModel):
    user_id: uuid.UUID
    available: bool
    from_time: datetime
    to_time: datetime


class AvailabilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    available: bool
    from_time: datetime
    to_time: datetime


# ── Leaves ──

class LeaveCreate(BaseModel):
    user_id: uuid.UUID
    leave_type: str
    start_date: datetime
    end_date: datetime


class LeaveResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    leave_type: str
    start_date: datetime
    end_date: datetime
    status: str
