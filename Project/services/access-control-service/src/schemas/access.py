"""
MedTrustX Access Control Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, ConfigDict

# ── Evaluate ──
class AccessEvaluateRequest(BaseModel):
    user_id: uuid.UUID
    resource: str
    action: str
    context: Optional[Dict[str, Any]] = None

class AccessDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    request_id: uuid.UUID
    decision: str
    reason: Optional[str]
    evaluated_at: datetime

# ── Policy Bindings ──
class PolicyBindingCreate(BaseModel):
    role_id: uuid.UUID
    policy_name: str

class PolicyBindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    role_id: uuid.UUID
    policy_name: str
    created_at: datetime

# ── Attributes ──
class AttributeCreate(BaseModel):
    attribute_key: str
    attribute_value: Dict[str, Any]

class AttributeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    attribute_key: str
    attribute_value: Dict[str, Any]
    updated_at: datetime

# ── Logs ──
class AccessLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    resource: str
    action: str
    decision: str
    timestamp: datetime
