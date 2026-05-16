"""
MedTrustX Credentialing Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Credentials ──

class CredentialCreateRequest(BaseModel):
    user_id: uuid.UUID
    credential_type: str
    issuing_authority: str = ""
    license_number: str = ""
    expires_at: Optional[datetime] = None


class CredentialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    credential_type: str
    issuing_authority: str
    license_number: Optional[str]
    status: str
    issued_at: datetime
    expires_at: Optional[datetime]


# ── Privileges ──

class PrivilegeCreateRequest(BaseModel):
    user_id: uuid.UUID
    privilege_type: str
    scope: str = ""
    expires_at: Optional[datetime] = None


class PrivilegeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    privilege_type: str
    status: str
    granted_at: datetime
    expires_at: Optional[datetime]
    scope: Optional[str]


# ── Verifications ──

class VerifyCredentialRequest(BaseModel):
    verifier_id: uuid.UUID
    notes: str = ""


class VerificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    credential_id: uuid.UUID
    verifier_id: uuid.UUID
    status: str
    verified_at: Optional[datetime]
    notes: Optional[str]


# ── Privileging Requests ──

class PrivilegingRequestCreate(BaseModel):
    user_id: uuid.UUID
    requested_privilege: str
    justification: str = ""


class PrivilegingRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    requested_privilege: str
    status: str
    requested_at: datetime
    approved_at: Optional[datetime]
    reviewed_by: Optional[uuid.UUID]
    justification: Optional[str]


# ── Events ──

class CredentialEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
