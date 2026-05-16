from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

class BypassRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    target_tenant_id: UUID
    reason: str
    duration_minutes: int
    approver_id: UUID
    justification_ticket: str

class BypassResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    bypass_token: str
    expires_at: datetime
