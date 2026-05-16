"""
MedTrustX Prometheus Monitoring Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Metrics ──

class MetricSeriesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    metric_name: str
    labels: Dict[str, str]
    value: float
    timestamp: datetime


# ── Alerts ──

class AlertRuleCreate(BaseModel):
    rule_name: str
    expression: str
    severity: str


class AlertRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    rule_name: str
    expression: str
    severity: str
    created_at: datetime


class AlertEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    rule_id: uuid.UUID
    status: str
    triggered_at: datetime


# ── Targets ──

class TargetResponse(BaseModel):
    target_url: str
    status: str
    last_scraped_at: datetime
