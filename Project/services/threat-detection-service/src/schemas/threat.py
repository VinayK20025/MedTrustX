"""
MedTrustX Threat Detection Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List

from pydantic import BaseModel, ConfigDict


# ── Analysis ──

class AnalyzeRequest(BaseModel):
    entity_id: uuid.UUID
    entity_type: str = "user"  # user | service | device
    event_type: str  # e.g. USER_LOGGED_IN, ACCESS_DENIED
    event_data: Dict[str, Any] = {}


class AnalyzeResponse(BaseModel):
    anomaly_score: float
    severity: str
    threat_type: Optional[str] = None
    recommended_action: Optional[str] = None
    risk_score: int


# ── Threat Events ──

class ThreatEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    entity_id: uuid.UUID
    entity_type: str
    anomaly_score: float
    severity: str
    detected_at: datetime


# ── Risk Scores ──

class RiskScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    entity_id: uuid.UUID
    score: int
    calculated_at: datetime
    factors: Dict[str, Any]


# ── Models ──

class ModelTrainRequest(BaseModel):
    model_name: str
    parameters: Dict[str, Any] = {}


class ModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_name: str
    version: str
    metadata_blob: Dict[str, Any]


# ── Alerts ──

class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    threat_type: str
    severity: str
    status: str
    description: Optional[str]
    alert_data: Dict[str, Any]
