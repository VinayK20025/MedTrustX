"""
MedTrustX Legal Risk Analytics Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class RiskEvaluateRequest(BaseModel):
    case_id: uuid.UUID
    case_data: Dict[str, Any]

class RiskFactorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    factor_name: str
    impact: float

class RiskScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    risk_level: str
    score: float
    created_at: datetime

class TrendResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    category: str
    metrics: Dict[str, Any]
    created_at: datetime

class ModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_name: str
    version: str
    accuracy: float
    created_at: datetime
