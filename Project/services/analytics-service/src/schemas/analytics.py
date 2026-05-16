"""
MedTrustX Analytics Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, ConfigDict


# ── Events ──

class EventIngestRequest(BaseModel):
    event_type: str
    source_service: str
    payload: Dict[str, Any] = {}


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    event_type: str
    source_service: str
    payload: Dict[str, Any]
    created_at: datetime


# ── Metrics ──

class MetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    metric_name: str
    value: float
    recorded_at: datetime
    dimensions: Dict[str, Any]


# ── Reports ──

class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    report_type: str
    generated_at: datetime
    data: Dict[str, Any]


# ── Predictions ──

class PredictionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_name: str
    entity_id: uuid.UUID
    prediction: Dict[str, Any]


# ── Dashboards ──

class DashboardCreateRequest(BaseModel):
    name: str
    config: Dict[str, Any] = {}


class DashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    config: Dict[str, Any]
