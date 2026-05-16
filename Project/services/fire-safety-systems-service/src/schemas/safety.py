"""
MedTrustX Fire & Safety Systems Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class DeviceCreate(BaseModel):
    device_type: str
    location: str

class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_type: str
    location: str
    status: str
    created_at: datetime

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    event_type: str
    severity: str
    payload: Dict[str, Any]
    created_at: datetime

class ActionCreate(BaseModel):
    action_type: str
    target_zone: Optional[str] = None

class ActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    action_type: str
    status: str
    triggered_at: datetime

class EvacuationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    zone: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
