from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

class TenantCreate(BaseModel):
    model_config = ConfigDict(strict=True)
    tenant_name: str
    tenant_slug: str
    admin_user_id: UUID
    metadata: Dict[str, Any] = {}

class TenantResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    tenant_id: UUID
    tenant_name: str
    tenant_slug: str
    status: str
    onboarded_at: datetime
    metadata: Dict[str, Any]

class TenantDetail(TenantResponse):
    patient_count: Optional[int] = None
    user_count: Optional[int] = None
    last_activity: Optional[datetime] = None
    db_stats: Optional[Dict[str, Any]] = None
    rls_status: Optional[Dict[str, Any]] = None
    active_bypasses: Optional[List[Dict[str, Any]]] = None

class TenantDeleteRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    reason: str
    purge_data: bool = False
    offboarded_by: UUID
