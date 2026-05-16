"""
MedTrustX Postal Mail Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


# ── Emails ──

class EmailMessageCreate(BaseModel):
    to_address: EmailStr
    subject: str
    body: str


class EmailMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    to_address: str
    subject: str
    status: str
    created_at: datetime


# ── Logs ──

class EmailLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    message_id: uuid.UUID
    status: str
    response: str
    logged_at: datetime


# ── Bounces ──

class EmailBounceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    message_id: uuid.UUID
    bounce_type: str
    description: Optional[str]
    created_at: datetime
