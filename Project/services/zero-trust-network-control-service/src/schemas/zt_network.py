"""
MedTrustX Zero Trust Network Control Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class PolicyCreate(BaseModel):
    policy_name: str
    rules: Dict[str, Any]

class PolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    policy_name: str
    rules: Dict[str, Any]
    created_at: datetime

class SessionCreate(BaseModel):
    user_id: uuid.UUID
    device_id: uuid.UUID

class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    device_id: uuid.UUID
    status: str
    started_at: datetime
    ended_at: Optional[datetime]

class AccessEvaluate(BaseModel):
    session_id: uuid.UUID
    resource: str
    action: str

class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    decision: str
    reason: Optional[str]
    created_at: datetime
