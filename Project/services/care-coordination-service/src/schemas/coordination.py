"""
MedTrustX Care Coordination Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Care Plans ──────────────────────────────────────────────────
class CarePlanCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    plan_name: str = Field(..., max_length=100)


class CarePlanUpdate(BaseModel):
    status: str = Field(..., description="active | completed | suspended | aborted")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"active", "completed", "suspended", "aborted"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class CarePlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    plan_name: str
    status: str
    created_at: datetime
    updated_at: datetime


# ── Care Tasks ──────────────────────────────────────────────────
class CareTaskCreate(BaseModel):
    task_name: str = Field(..., max_length=100)
    assigned_to: Optional[uuid.UUID] = None
    due_time: Optional[datetime] = None


class CareTaskUpdate(BaseModel):
    status: Optional[str] = Field(None, description="pending | in_progress | completed | skipped")
    assigned_to: Optional[uuid.UUID] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"pending", "in_progress", "completed", "skipped"}
            if v.lower() not in allowed:
                raise ValueError(f"status must be one of {allowed}")
            return v.lower()
        return v


class CareTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    care_plan_id: uuid.UUID
    task_name: str
    assigned_to: Optional[uuid.UUID]
    status: str
    due_time: Optional[datetime]
    completed_at: Optional[datetime]


# ── Care Workflows ──────────────────────────────────────────────
class CareWorkflowCreate(BaseModel):
    workflow_name: str = Field(..., max_length=100)
    definition: Dict[str, Any]
    active: bool = True


class CareWorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    workflow_name: str
    definition: Dict[str, Any]
    version: int
    active: bool
    created_at: datetime
