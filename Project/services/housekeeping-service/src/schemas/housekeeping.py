"""
MedTrustX Housekeeping Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Housekeeping Tasks ──

class HousekeepingTaskCreate(BaseModel):
    room_id: uuid.UUID
    task_type: str
    assigned_to: uuid.UUID
    scheduled_at: datetime


class HousekeepingTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    room_id: uuid.UUID
    task_type: str
    status: str
    assigned_to: uuid.UUID
    scheduled_at: datetime


# ── Room Status ──

class RoomStatusUpdate(BaseModel):
    room_id: uuid.UUID
    status: str


class RoomStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    room_id: uuid.UUID
    status: str
    updated_at: datetime


# ── Sanitation Logs ──

class SanitationLogCreate(BaseModel):
    area: str
    cleaning_type: str


class SanitationLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    area: str
    cleaning_type: str
    performed_at: datetime


# ── Waste Management ──

class WasteManagementCreate(BaseModel):
    waste_type: str
    quantity: float


class WasteManagementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    waste_type: str
    quantity: float
    disposed_at: datetime


# ── Housekeeping Events ──

class HousekeepingEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
