"""
MedTrustX Operational Command Center Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Incidents ──

class IncidentCreate(BaseModel):
    type: str
    severity: str = "medium"


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    type: str
    severity: str
    status: str
    created_at: datetime


# ── Commands ──

class CommandCreate(BaseModel):
    target_system: str
    action: str
    payload: Dict[str, Any] = {}


class CommandResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    target_system: str
    action: str
    payload: Dict[str, Any]
    status: str
    created_at: datetime


# ── Events ──

class OperationalEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    event_type: str
    source: str
    payload: Dict[str, Any]
    created_at: datetime


# ── Sessions ──

class ControlSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    operator_id: uuid.UUID
    started_at: datetime
    ended_at: Optional[datetime] = None
    created_at: datetime
