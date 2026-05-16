"""
MedTrustX PAM Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

# ── Privilege Requests ──
class AccessRequestCreate(BaseModel):
    user_id: uuid.UUID
    requested_role: str
    reason: Optional[str] = None

class AccessRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    requested_role: str
    reason: Optional[str]
    status: str
    requested_at: datetime
    approved_at: Optional[datetime]

# ── Approvals ──
class ApprovalAction(BaseModel):
    request_id: uuid.UUID
    approver_id: uuid.UUID

# ── Sessions ──
class SessionStart(BaseModel):
    user_id: uuid.UUID
    request_id: uuid.UUID

class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    session_token: str
    status: str
    started_at: datetime
    ended_at: Optional[datetime]

# ── Accounts ──
class AccountCreate(BaseModel):
    account_name: str
    system: str

class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    account_name: str
    system: str
    status: str
    created_at: datetime
