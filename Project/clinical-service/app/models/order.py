"""
Order Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class OrderCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    patient_id: str
    order_type: str
    order_code: str
    priority: str
    ordered_by: str
    description: Optional[str] = None

class OrderRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    id: str
    tenant_id: str
    patient_id: str
    order_type: str
    order_code: str
    coding_system: str
    description: Optional[str]
    priority: str
    status: str
    ordered_by: str
    ordered_at: datetime
    fulfilled_at: Optional[datetime] = None
