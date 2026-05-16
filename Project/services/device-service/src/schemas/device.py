"""
MedTrustX Devices & IoMT Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Devices ─────────────────────────────────────────────────────
class DeviceCreate(BaseModel):
    device_type: str = Field(..., max_length=50)
    manufacturer: str = Field(..., max_length=100)
    model: str = Field(..., max_length=100)


class DeviceUpdate(BaseModel):
    status: str = Field(..., description="active | maintenance | retired | offline")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"active", "maintenance", "retired", "offline"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_type: str
    manufacturer: str
    model: str
    status: str
    registered_at: datetime


# ── Assignments ─────────────────────────────────────────────────
class DeviceAssignRequest(BaseModel):
    patient_id: uuid.UUID


class DeviceAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    patient_id: uuid.UUID
    assigned_at: datetime
    unassigned_at: Optional[datetime] = None


# ── Telemetry ───────────────────────────────────────────────────
class TelemetryPayload(BaseModel):
    metric: str = Field(..., max_length=50)
    value: str = Field(..., max_length=100)
    recorded_at: datetime


class TelemetryBatchRequest(BaseModel):
    """Allows devices to push arrays of data efficiently."""
    data: List[TelemetryPayload]


class TelemetryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    metric: str
    value: str
    recorded_at: datetime


# ── Alerts ──────────────────────────────────────────────────────
class DeviceAlertCreate(BaseModel):
    alert_type: str = Field(..., max_length=50)
    severity: str = Field(..., description="info | warning | critical")
    message: str

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        allowed = {"info", "warning", "critical"}
        if v.lower() not in allowed:
            raise ValueError(f"severity must be one of {allowed}")
        return v.lower()


class DeviceAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    alert_type: str
    severity: str
    message: str
    triggered_at: datetime
    resolved_at: Optional[datetime] = None
