"""
MedTrustX Jitsi Conferencing Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Conference Rooms ──

class ConferenceRoomCreate(BaseModel):
    room_name: str
    created_by: uuid.UUID


class ConferenceRoomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    room_name: str
    created_by: uuid.UUID
    created_at: datetime


# ── Participants ──

class ParticipantJoin(BaseModel):
    user_id: uuid.UUID
    role: str = "attendee"


class ParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    room_id: uuid.UUID
    user_id: uuid.UUID
    role: str
    joined_at: datetime


# ── Sessions ──

class ConferenceSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    room_id: uuid.UUID
    status: str
    started_at: datetime
    ended_at: Optional[datetime]
