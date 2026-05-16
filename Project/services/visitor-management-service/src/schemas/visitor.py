"""
MedTrustX Visitor Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class VisitorCreate(BaseModel):
    name: str
    id_type: str
    id_value: str

class VisitorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    id_type: str
    created_at: datetime

class VisitCreate(BaseModel):
    visitor_id: uuid.UUID
    host_id: uuid.UUID
    purpose: str

class VisitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    visitor_id: uuid.UUID
    host_id: uuid.UUID
    purpose: str
    status: str
    check_in: Optional[datetime]
    check_out: Optional[datetime]

class LogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    visit_id: uuid.UUID
    event_type: str
    created_at: datetime
