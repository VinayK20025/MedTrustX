"""
MedTrustX Network Observability Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class FlowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    source_ip: str
    destination_ip: str
    protocol: str
    bytes: int
    timestamp: datetime

class MetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    metric_name: str
    value: float
    timestamp: datetime

class DependencyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    source_service: str
    destination_service: str
    latency: float
    created_at: datetime

class AnomalyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    type: str
    severity: str
    details: Dict[str, Any]
    created_at: datetime
