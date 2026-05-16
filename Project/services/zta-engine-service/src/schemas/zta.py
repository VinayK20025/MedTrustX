"""
MedTrustX ZTA Engine Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, Any, List

from pydantic import BaseModel, ConfigDict

# ── Evaluate Access ──
class AccessEvaluationRequest(BaseModel):
    user_id: uuid.UUID
    resource: str
    action: str
    context: Dict[str, Any]

class AccessDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    resource: str
    decision: str
    reason: str
    decided_at: datetime

# ── Update Context ──
class ContextUpdateRequest(BaseModel):
    session_id: uuid.UUID
    attributes: Dict[str, str]

class ContextAttributeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    attribute_key: str
    attribute_value: str
    recorded_at: datetime

# ── Sessions ──
class TrustSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    risk_score: int
    trust_level: str
    created_at: datetime
    updated_at: datetime

# ── Risk Events ──
class RiskEventCreate(BaseModel):
    user_id: uuid.UUID
    event_type: str
    risk_score: int

class RiskEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    event_type: str
    risk_score: int
    recorded_at: datetime
