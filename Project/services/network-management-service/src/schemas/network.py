"""
MedTrustX Network Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_type: str
    ip_address: str
    status: str
    created_at: datetime

class MetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    metric_name: str
    value: float
    timestamp: datetime

class TopologyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    source_device: uuid.UUID
    target_device: uuid.UUID
    link_status: str
    created_at: datetime

class FaultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    fault_type: str
    severity: str
    created_at: datetime
