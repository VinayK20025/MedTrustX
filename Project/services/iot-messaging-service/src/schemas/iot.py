"""
MedTrustX IoT Messaging Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict

from pydantic import BaseModel, ConfigDict


# ── Connections ──

class DeviceConnectionCreate(BaseModel):
    device_id: uuid.UUID


class DeviceConnectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    status: str
    connected_at: datetime


# ── Topics ──

class MqttTopicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    topic: str
    qos: int
    created_at: datetime


# ── Messages ──

class MessageLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    topic: str
    payload: Dict[str, Any]
    received_at: datetime


# ── Commands ──

class DeviceCommandCreate(BaseModel):
    command: Dict[str, Any]


class DeviceCommandResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    command: Dict[str, Any]
    status: str
    sent_at: datetime


# ── Events ──

class DeviceEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
