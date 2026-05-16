"""
Breach Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID

class BreachNotificationRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    notified_by: str
    notification_type: str
    notes: str

class BreachIncidentResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    id: UUID
    tenant_id: UUID
    detected_at: datetime
    breach_type: str
    severity: str
    affected_records_count: int
    affected_user_ids: List[str]
    evidence: Dict[str, Any]
    status: str
    notified_at: Optional[datetime]
    notification_sent: bool
