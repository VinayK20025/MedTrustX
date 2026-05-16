"""
MedTrustX Multi-Tenant Isolation Manager Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class TenantCreate(BaseModel):
    name: str

class TenantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    status: str
    created_at: datetime

class PolicyCreate(BaseModel):
    policy_name: str
    rules: Dict[str, Any]

class PolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    policy_name: str
    rules: Dict[str, Any]
    created_at: datetime

class AccessLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    resource_type: str
    resource_id: uuid.UUID
    action: str
    status: str
    created_at: datetime

class ContextResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    request_id: uuid.UUID
    service_name: str
    propagated_at: datetime
