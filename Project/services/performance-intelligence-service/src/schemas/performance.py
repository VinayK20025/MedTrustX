"""
MedTrustX Performance Intelligence Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class EvaluateRequest(BaseModel):
    service_name: str

class MetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_name: str
    metric_name: str
    value: float
    timestamp: datetime

class BenchmarkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_name: str
    metric_name: str
    baseline: float
    created_at: datetime

class ScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_name: str
    score: float
    evaluated_at: datetime

class InsightResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_name: str
    insight: str
    impact: float
    created_at: datetime
