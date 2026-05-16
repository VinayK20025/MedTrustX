"""
MedTrustX Security Incident Response Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class IncidentCreate(BaseModel):
    type: str
    severity: str
    location: str

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    type: str
    severity: str
    status: str
    location: str
    created_at: datetime

class ActionCreate(BaseModel):
    action_type: str

class ActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    incident_id: uuid.UUID
    action_type: str
    status: str
    performed_at: datetime

class ResponderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    status: str
    assigned_at: datetime

class LogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    incident_id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
