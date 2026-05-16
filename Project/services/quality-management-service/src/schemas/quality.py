"""
MedTrustX Quality Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Metrics ──

class QualityMetricCreate(BaseModel):
    metric_name: str
    value: float
    context: Dict[str, Any] = {}


class QualityMetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    metric_name: str
    value: float
    recorded_at: datetime
    context: Dict[str, Any]


# ── Incidents ──

class IncidentCreate(BaseModel):
    incident_type: str
    severity: str
    description: str
    reporter_id: Optional[uuid.UUID] = None


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    incident_type: str
    severity: str
    status: str
    reported_at: datetime
    description: str
    reporter_id: Optional[uuid.UUID]


# ── RCA ──

class RCACreate(BaseModel):
    findings: str
    actions: str


class RCAResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    incident_id: uuid.UUID
    findings: Optional[str]
    actions: Optional[str]
    status: str
    completed_at: Optional[datetime]


# ── Audits ──

class AuditCreate(BaseModel):
    audit_type: str
    status: str = "planned"


class AuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    audit_type: str
    status: str
    conducted_at: Optional[datetime]
    findings_summary: Optional[str]


# ── Improvement Plans ──

class ImprovementPlanCreate(BaseModel):
    plan_name: str
    description: str = ""
    target_metric: str = ""


class ImprovementPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plan_name: str
    description: Optional[str]
    status: str
    target_metric: Optional[str]
    created_at: datetime
