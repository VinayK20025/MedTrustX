"""
MedTrustX Executive Dashboard Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class DashboardCreate(BaseModel):
    name: str
    config: Dict[str, Any]

class DashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    config: Dict[str, Any]
    created_at: datetime

class KPIResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    value: float
    timestamp: datetime

class WidgetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    dashboard_id: uuid.UUID
    widget_type: str
    config: Dict[str, Any]

class AccessLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    dashboard_id: uuid.UUID
    accessed_at: datetime
