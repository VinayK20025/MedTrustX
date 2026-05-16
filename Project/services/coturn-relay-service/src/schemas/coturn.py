"""
MedTrustX Coturn Relay Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Credentials ──

class TurnCredentialCreate(BaseModel):
    username: str


class TurnCredentialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    username: str
    credential: str
    expires_at: datetime


# ── Sessions ──

class TurnSessionCreate(BaseModel):
    user_id: uuid.UUID
    session_id: str
    relay_ip: str


class TurnSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    session_id: str
    relay_ip: str
    started_at: datetime
    ended_at: Optional[datetime]


# ── Usage Logs ──

class RelayUsageLogCreate(BaseModel):
    session_id: str
    bytes_transferred: int


class RelayUsageLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: str
    bytes_transferred: int
    created_at: datetime
