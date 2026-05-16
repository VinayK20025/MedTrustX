"""
MedTrustX Perimeter Security Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class ZoneCreate(BaseModel):
    name: str
    boundary: Dict[str, Any]

class ZoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    boundary: Dict[str, Any]
    created_at: datetime

class SensorCreate(BaseModel):
    zone_id: uuid.UUID
    sensor_type: str

class SensorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    zone_id: uuid.UUID
    sensor_type: str
    status: str
    created_at: datetime

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    zone_id: uuid.UUID
    event_type: str
    severity: str
    created_at: datetime

class ResponseCreate(BaseModel):
    event_id: uuid.UUID
    action_type: str

class ResponseActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    event_id: uuid.UUID
    action_type: str
    status: str
    triggered_at: datetime
