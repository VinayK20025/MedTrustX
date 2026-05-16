"""
JIT Request Models.
"""
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class JITCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    resource_type: str
    resource_id: str
    reason: str
    duration_minutes: int

class JITResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    id: UUID
    user_id: UUID
    tenant_id: UUID
    resource_type: str
    resource_id: str
    status: str
    created_at: datetime
    approved_at: Optional[datetime] = None
    approved_by: Optional[UUID] = None

class JITApprovalRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    status: str
