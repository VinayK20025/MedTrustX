"""
MedTrustX IAM Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, EmailStr

# ── Authentication ──
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# ── Users ──
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    status: Optional[str] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    username: str
    email: str
    status: str
    created_at: datetime

# ── Roles ──
class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None

class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    description: Optional[str]

class UserRoleAssign(BaseModel):
    role_id: uuid.UUID

# ── Sessions ──
class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    expires_at: datetime
    created_at: datetime
