"""
MedTrustX Keycloak Shim Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

# ── Users ──
class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str
    enabled: bool = True

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    username: str
    email: Optional[str]
    enabled: bool
    created_at: datetime

# ── OIDC Token ──
class TokenResponse(BaseModel):
    access_token: str
    expires_in: int
    refresh_expires_in: int
    refresh_token: str
    token_type: str
    not_before_policy: int
    session_state: str
    scope: str

class LogoutRequest(BaseModel):
    client_id: str
    refresh_token: str

# ── UserInfo ──
class UserInfoResponse(BaseModel):
    sub: str
    preferred_username: str
    email: Optional[str] = None
