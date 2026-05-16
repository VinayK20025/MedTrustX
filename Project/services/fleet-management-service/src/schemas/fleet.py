"""
MedTrustX Fleet Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Vehicles ──

class VehicleCreate(BaseModel):
    vehicle_type: str
    registration_number: str


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    vehicle_type: str
    registration_number: str
    status: str
    created_at: datetime


# ── Drivers ──

class DriverCreate(BaseModel):
    user_id: uuid.UUID
    license_number: str


class DriverResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    license_number: str
    status: str
    created_at: datetime


# ── Trips ──

class TripCreate(BaseModel):
    vehicle_id: uuid.UUID
    trip_type: str
    start_location: str
    end_location: str
    started_at: datetime


class TripResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    vehicle_id: uuid.UUID
    trip_type: str
    start_location: str
    end_location: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None


# ── Assignments ──

class AssignmentCreate(BaseModel):
    trip_id: uuid.UUID
    driver_id: uuid.UUID


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    trip_id: uuid.UUID
    driver_id: uuid.UUID
    assigned_at: datetime


# ── Vehicle Tracking ──

class VehicleTrackingCreate(BaseModel):
    latitude: float
    longitude: float


class VehicleTrackingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    vehicle_id: uuid.UUID
    latitude: float
    longitude: float
    recorded_at: datetime
