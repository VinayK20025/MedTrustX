"""
MedTrustX Role Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

# ── Roles ──
class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    description: Optional[str]
    created_at: datetime

# ── Permissions ──
class PermissionCreate(BaseModel):
    name: str
    resource: str
    action: str

class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    resource: str
    action: str

class RolePermissionAssign(BaseModel):
    permission_id: uuid.UUID

class RolePermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    role_id: uuid.UUID
    permission_id: uuid.UUID
    assigned_at: datetime

# ── Role Hierarchy ──
class RoleHierarchyCreate(BaseModel):
    child_role_id: uuid.UUID

class RoleHierarchyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    parent_role_id: uuid.UUID
    child_role_id: uuid.UUID

# ── User Role Assignments ──
class UserRoleAssign(BaseModel):
    role_id: uuid.UUID

class UserRoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    role_id: uuid.UUID
    assigned_at: datetime
