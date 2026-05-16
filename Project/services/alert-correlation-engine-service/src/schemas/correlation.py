"""
MedTrustX Alert Correlation Engine Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Alerts ──

class AlertCreate(BaseModel):
    source: str
    type: str
    severity: str = "medium"
    payload: Dict[str, Any] = {}


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    source: str
    type: str
    severity: str
    payload: Dict[str, Any]
    created_at: datetime


# ── Correlated Incidents ──

class CorrelatedIncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    incident_key: str
    root_cause: Optional[str]
    severity: str
    status: str
    created_at: datetime


# ── Suppression Rules ──

class SuppressionRuleCreate(BaseModel):
    rule_name: str
    conditions: Dict[str, Any]


class SuppressionRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    rule_name: str
    conditions: Dict[str, Any]
    created_at: datetime
