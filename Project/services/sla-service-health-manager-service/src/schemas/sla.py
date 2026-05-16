"""
MedTrustX SLA & Service Health Manager Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class SlaCreate(BaseModel):
    service_name: str
    uptime_target: float = 99.9
    latency_target: float = 200.0

class SlaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_name: str
    uptime_target: float
    latency_target: float
    created_at: datetime

class HealthResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_name: str
    health_score: float
    status: str
    updated_at: datetime

class ViolationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    sla_id: uuid.UUID
    violation_type: str
    severity: str
    detected_at: datetime

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_name: str
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
