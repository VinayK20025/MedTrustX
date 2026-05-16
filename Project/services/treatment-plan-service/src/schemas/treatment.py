"""
MedTrustX Treatment Plan Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Items ───────────────────────────────────────────────────────
class TreatmentPlanItemCreate(BaseModel):
    item_type: str = Field(..., max_length=50, description="medication | procedure | monitoring | lifestyle")
    description: str
    schedule: Dict[str, Any]

    @field_validator("item_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"medication", "procedure", "monitoring", "lifestyle"}
        if v.lower() not in allowed:
            raise ValueError(f"item_type must be one of {allowed}")
        return v.lower()


class TreatmentPlanItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    treatment_plan_id: uuid.UUID
    item_type: str
    description: str
    schedule: Dict[str, Any]
    status: str
    created_at: datetime


# ── Plans ───────────────────────────────────────────────────────
class TreatmentPlanCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    plan_name: str = Field(..., max_length=100)
    items: List[TreatmentPlanItemCreate] = Field(default_factory=list)


class TreatmentPlanUpdate(BaseModel):
    status: Optional[str] = Field(None, description="active | completed | suspended")
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"active", "completed", "suspended"}
            if v.lower() not in allowed:
                raise ValueError(f"status must be one of {allowed}")
            return v.lower()
        return v


class TreatmentPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    plan_name: str
    status: str
    version: int
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime
    items: List[TreatmentPlanItemResponse] = []


# ── Versions ────────────────────────────────────────────────────
class TreatmentPlanVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    treatment_plan_id: uuid.UUID
    version: int
    changes: Dict[str, Any]
    created_at: datetime


# ── Adherence ───────────────────────────────────────────────────
class TreatmentAdherenceCreate(BaseModel):
    adherence_status: str = Field(..., max_length=20, description="compliant | non_compliant | partial")
    notes: Optional[str] = None

    @field_validator("adherence_status")
    @classmethod
    def validate_adherence(cls, v: str) -> str:
        allowed = {"compliant", "non_compliant", "partial"}
        if v.lower() not in allowed:
            raise ValueError(f"adherence_status must be one of {allowed}")
        return v.lower()


class TreatmentAdherenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    treatment_plan_id: uuid.UUID
    adherence_status: str
    notes: Optional[str]
    recorded_at: datetime
