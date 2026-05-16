"""
MedTrustX Telemedicine Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict

# ── Events ──
class SessionEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    tenant_id: uuid.UUID
    event_type: str
    payload: Optional[Dict[str, Any]]
    created_at: datetime

# ── Recordings ──
class RecordingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    tenant_id: uuid.UUID
    file_url: str
    status: str
    created_at: datetime

# ── Tokens ──
class TokenResponse(BaseModel):
    token: str
    expires_at: datetime

# ── Participants ──
class ParticipantCreate(BaseModel):
    user_id: uuid.UUID
    role: str

class ParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    user_id: uuid.UUID
    role: str
    join_time: Optional[datetime]
    leave_time: Optional[datetime]

# ── Sessions ──
class TeleSessionCreate(BaseModel):
    appointment_id: Optional[uuid.UUID] = None
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    scheduled_at: Optional[datetime] = None

class TeleSessionUpdate(BaseModel):
    status: Optional[str] = None
    scheduled_at: Optional[datetime] = None

class TeleSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    appointment_id: Optional[uuid.UUID]
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    tenant_id: uuid.UUID
    status: str
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

class TeleSessionDetail(TeleSessionResponse):
    participants: List[ParticipantResponse] = []
    recordings: List[RecordingResponse] = []
    events: List[SessionEventResponse] = []

class TeleSessionList(BaseModel):
    items: List[TeleSessionResponse]
    total: int
    page: int
    page_size: int
