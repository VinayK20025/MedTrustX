"""
MedTrustX Facilities Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Facilities & Rooms ──────────────────────────────────────────
class FacilityCreate(BaseModel):
    name: str = Field(..., max_length=100)
    type: str = Field(..., description="main_hospital | clinic | laboratory | storage")
    location: str


class FacilityUpdate(BaseModel):
    status: str = Field(..., description="active | inactive | maintenance")


class RoomCreate(BaseModel):
    facility_id: uuid.UUID
    room_number: str = Field(..., max_length=50)
    type: str = Field(..., description="ward | icu | ot | consultation | lab | utility")


class RoomUpdate(BaseModel):
    status: str = Field(..., description="available | occupied | maintenance | cleaning")


class RoomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    facility_id: uuid.UUID
    room_number: str
    type: str
    status: str


class FacilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    type: str
    location: str
    status: str
    created_at: datetime
    rooms: List[RoomResponse] = []


# ── Assets ──────────────────────────────────────────────────────
class AssetCreate(BaseModel):
    name: str = Field(..., max_length=100)
    category: str = Field(..., description="medical_equipment | utility | hvac | IT | furniture")
    location: str = Field(..., max_length=100)


class AssetUpdate(BaseModel):
    status: str = Field(..., description="operational | degraded | offline | maintenance")


class AssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    category: str
    location: str
    status: str
    created_at: datetime


# ── Maintenance ─────────────────────────────────────────────────
class MaintenanceRequestCreate(BaseModel):
    asset_id: uuid.UUID
    issue_description: str


class MaintenanceRequestUpdate(BaseModel):
    status: str = Field(..., description="open | in_progress | resolved | cancelled")


class MaintenanceRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    asset_id: uuid.UUID
    issue_description: str
    status: str
    reported_at: datetime
    resolved_at: Optional[datetime]


class MaintenanceScheduleCreate(BaseModel):
    asset_id: uuid.UUID
    schedule_type: str = Field(..., description="weekly | monthly | annual | usage_based")
    next_due: datetime


class MaintenanceScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    asset_id: uuid.UUID
    schedule_type: str
    next_due: datetime
