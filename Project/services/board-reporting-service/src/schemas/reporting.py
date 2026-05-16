"""
MedTrustX Board Reporting Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class ReportCreate(BaseModel):
    title: str
    type: str

class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    type: str
    status: str
    created_at: datetime

class ScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    report_id: uuid.UUID
    frequency: str
    next_run: datetime

class DistributionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    report_id: uuid.UUID
    recipient_id: uuid.UUID
    status: str
    sent_at: Optional[datetime]
