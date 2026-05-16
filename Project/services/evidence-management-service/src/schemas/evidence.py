"""
MedTrustX Evidence Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class EvidenceCreate(BaseModel):
    case_id: uuid.UUID
    type: str
    file_path: str
    hash: str

class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    type: str
    file_path: str
    hash: str
    created_at: datetime

class CustodyCreate(BaseModel):
    action: str
    performed_by: uuid.UUID

class CustodyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    evidence_id: uuid.UUID
    action: str
    performed_by: uuid.UUID
    timestamp: datetime

class MetadataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    evidence_id: uuid.UUID
    metadata_json: Dict[str, Any]
    created_at: datetime

class AccessRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    evidence_id: uuid.UUID
    user_id: uuid.UUID
    action: str
    created_at: datetime
