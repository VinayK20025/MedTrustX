"""
User Models.
"""
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

class UserCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    role: str
    department: str
    tenant_id: UUID

class UserResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    id: UUID
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    status: str
    tenant_id: UUID

class UserDetailResponse(UserResponse):
    model_config = ConfigDict(strict=True)
    role_assignments: list[str]
    mfa_methods_enrolled: list[str]
    active_sessions: int
    registered_devices: int
    last_login: Optional[datetime] = None

class UserUpdateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    status: Optional[str] = None
    department: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
