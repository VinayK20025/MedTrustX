"""
Role Models.
"""
from typing import Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class RoleAssignmentRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    user_id: UUID
    role_id: UUID
    tenant_id: UUID
    assigned_by: UUID

class RoleRevokeRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    user_id: UUID
    role_id: UUID
    tenant_id: UUID
