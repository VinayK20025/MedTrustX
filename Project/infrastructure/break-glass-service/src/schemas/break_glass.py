"""
MedTrustX Break-Glass — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class BreakGlassRequestCreate(BaseModel):
    user_id: uuid.UUID
    justification: str
    context: Dict[str, Any] = {}
    policy_name: str = "general_emergency"
    mfa_verified: bool = False
    device_compliant: bool = False


class BreakGlassRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    justification: str
    context: Dict[str, Any]
    risk_level: str
    policy_name: str
    status: str
    requested_at: datetime
    mfa_verified: bool


class ApprovalCreate(BaseModel):
    approver_id: uuid.UUID
    decision: str
    reason: Optional[str] = None


class ApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    request_id: str
    approver_id: str
    decision: str
    reason: Optional[str]
    decided_at: datetime


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    request_id: str
    user_id: str
    scope: Dict[str, Any]
    status: str
    expires_at: datetime
    started_at: datetime


class AuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    session_id: str
    user_id: str
    action: str
    resource: str
    audit_metadata: Dict[str, Any]
    created_at: datetime
