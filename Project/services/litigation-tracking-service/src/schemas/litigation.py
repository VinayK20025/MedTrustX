"""
MedTrustX Litigation Tracking Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class LitigationCreate(BaseModel):
    case_id: uuid.UUID
    court_name: str
    filed_at: datetime

class LitigationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    court_name: str
    status: str
    filed_at: datetime
    created_at: datetime

class HearingCreate(BaseModel):
    hearing_date: datetime
    notes: Optional[str] = None

class HearingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    litigation_id: uuid.UUID
    hearing_date: datetime
    status: str
    notes: Optional[str]
    created_at: datetime

class UpdateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    litigation_id: uuid.UUID
    update_type: str
    details: Dict[str, Any]
    created_at: datetime
