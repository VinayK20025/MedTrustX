"""
MedTrustX AI Governance & Explainability Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List
from pydantic import BaseModel, ConfigDict

class ModelCreate(BaseModel):
    name: str
    version: str

class ModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    version: str
    status: str
    created_at: datetime

class DecisionCreate(BaseModel):
    model_id: uuid.UUID
    input: Dict[str, Any]
    output: Dict[str, Any]
    decision: str

class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_id: uuid.UUID
    input: Dict[str, Any]
    output: Dict[str, Any]
    decision: str
    created_at: datetime

class ExplainabilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_id: uuid.UUID
    explanation: Dict[str, Any]
    created_at: datetime

class PolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    policy_name: str
    rules: Dict[str, Any]
    created_at: datetime
