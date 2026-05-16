"""
MedTrustX Physical Access Control Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class PointCreate(BaseModel):
    name: str
    location: str

class PointResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    location: str
    status: str
    created_at: datetime

class CredentialCreate(BaseModel):
    user_id: uuid.UUID
    type: str
    value: str

class CredentialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    type: str
    value: str
    status: str
    created_at: datetime

class PolicyCreate(BaseModel):
    role: str
    zone: str
    rules: Dict[str, Any]

class PolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    role: str
    zone: str
    rules: Dict[str, Any]
    created_at: datetime

class AccessCheckRequest(BaseModel):
    access_point_id: uuid.UUID
    credential_type: str
    credential_value: str

class AccessCheckResponse(BaseModel):
    granted: bool
    user_id: Optional[uuid.UUID] = None
    reason: str

class AccessLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    access_point_id: uuid.UUID
    action: str
    status: str
    created_at: datetime
