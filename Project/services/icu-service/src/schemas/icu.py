"""
MedTrustX ICU Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── ICU Patient Admissions ──────────────────────────────────────
class ICUPatientCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    bed_id: Optional[uuid.UUID] = None


class ICUPatientUpdate(BaseModel):
    status: str = Field(..., description="active | discharged")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v.lower() not in {"active", "discharged"}:
            raise ValueError("status must be active or discharged")
        return v.lower()


class ICUPatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    bed_id: Optional[uuid.UUID] = None
    status: str
    admitted_at: datetime


# ── Continuous Vitals ───────────────────────────────────────────
class ICUVitalCreate(BaseModel):
    metric: str = Field(..., max_length=50)
    value: str = Field(..., max_length=50)
    recorded_at: Optional[datetime] = None


class ICUVitalsBatchCreate(BaseModel):
    patient_id: uuid.UUID
    vitals: List[ICUVitalCreate]


class ICUVitalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    metric: str
    value: str
    recorded_at: datetime


# ── Device Data ─────────────────────────────────────────────────
class DeviceDataCreate(BaseModel):
    patient_id: uuid.UUID
    device_id: uuid.UUID
    data: Dict[str, Any]
    recorded_at: Optional[datetime] = None


class DeviceDataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    device_id: uuid.UUID
    data: Dict[str, Any]
    recorded_at: datetime


# ── ICU Alerts ──────────────────────────────────────────────────
class ICUAlertCreate(BaseModel):
    patient_id: uuid.UUID
    alert_type: str = Field(..., max_length=50)
    severity: str = Field(..., description="low | medium | high | critical")
    message: str

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        allowed = {"low", "medium", "high", "critical"}
        if v.lower() not in allowed:
            raise ValueError(f"severity must be one of {allowed}")
        return v.lower()


class ICUAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    alert_type: str
    severity: str
    message: str
    triggered_at: datetime
    resolved_at: Optional[datetime] = None
