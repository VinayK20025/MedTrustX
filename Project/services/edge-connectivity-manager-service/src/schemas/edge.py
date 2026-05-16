"""
MedTrustX Edge Connectivity Manager Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class NodeCreate(BaseModel):
    name: str
    location: Optional[str] = None

class NodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    location: Optional[str]
    status: str
    created_at: datetime

class ConnectRequest(BaseModel):
    node_id: uuid.UUID
    tunnel_type: str

class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    node_id: uuid.UUID
    tunnel_type: str
    status: str
    started_at: datetime
    ended_at: Optional[datetime]

class MetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    node_id: uuid.UUID
    latency: float
    bandwidth: float
    packet_loss: float
    timestamp: datetime

class SyncLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    node_id: uuid.UUID
    sync_status: str
    data_volume: int
    created_at: datetime
