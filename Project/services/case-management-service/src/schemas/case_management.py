"""
MedTrustX Case Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Cases ──

class CaseCreate(BaseModel):
    patient_id: uuid.UUID
    case_type: str


class CaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    case_type: str
    status: str
    created_at: datetime


# ── Care Plans ──

class CarePlanCreate(BaseModel):
    plan_details: Dict[str, Any]


class CarePlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    plan_details: Dict[str, Any]
    created_at: datetime


# ── Case Tasks ──

class CaseTaskCreate(BaseModel):
    task_type: str
    assigned_to: uuid.UUID
    due_date: datetime


class CaseTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    task_type: str
    status: str
    assigned_to: uuid.UUID
    due_date: datetime


# ── Case Notes ──

class CaseNoteCreate(BaseModel):
    note: str
    created_by: uuid.UUID


class CaseNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    note: str
    created_by: uuid.UUID
    created_at: datetime


# ── Case Outcomes ──

class CaseOutcomeCreate(BaseModel):
    outcome_type: str
    value: Dict[str, Any]


class CaseOutcomeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    outcome_type: str
    value: Dict[str, Any]
    recorded_at: datetime
