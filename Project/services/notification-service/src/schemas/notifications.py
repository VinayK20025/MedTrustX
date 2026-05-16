"""
MedTrustX Notification Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict

# ── Templates ──
class TemplateCreate(BaseModel):
    name: str
    channel: str
    content: str

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    channel: Optional[str] = None
    content: Optional[str] = None

class TemplateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    channel: str
    content: str
    created_at: datetime

# ── Preferences ──
class PreferenceUpdate(BaseModel):
    channel: str
    enabled: bool

class PreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    tenant_id: uuid.UUID
    channel: str
    enabled: bool
    updated_at: datetime

# ── Logs ──
class NotificationLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    notification_id: uuid.UUID
    tenant_id: uuid.UUID
    status: str
    response: Optional[str]
    attempted_at: datetime

# ── Notifications ──
class NotificationCreate(BaseModel):
    recipient_id: uuid.UUID
    channel: str
    template_id: Optional[uuid.UUID] = None
    payload: Optional[Dict[str, Any]] = None
    scheduled_at: Optional[datetime] = None

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    recipient_id: uuid.UUID
    channel: str
    template_id: Optional[uuid.UUID]
    payload: Optional[Dict[str, Any]]
    status: str
    created_at: datetime

class NotificationDetail(NotificationResponse):
    logs: List[NotificationLogResponse] = []
