"""
MedTrustX Performance Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── KPIs ──

class KPICreate(BaseModel):
    name: str
    description: str = ""
    target_value: float


class KPIResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: str
    target_value: float
    created_at: datetime


# ── Performance Records ──

class PerformanceRecordCreate(BaseModel):
    entity_id: uuid.UUID
    entity_type: str
    kpi_id: uuid.UUID
    value: float


class PerformanceRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    entity_id: uuid.UUID
    entity_type: str
    kpi_id: uuid.UUID
    value: float
    recorded_at: datetime


# ── Scorecards ──

class ScorecardCreate(BaseModel):
    user_id: uuid.UUID
    period: str
    score: float


class ScorecardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    period: str
    score: float
    created_at: datetime


# ── Benchmarks ──

class BenchmarkCreate(BaseModel):
    kpi_id: uuid.UUID
    benchmark_value: float


class BenchmarkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    kpi_id: uuid.UUID
    benchmark_value: float
    created_at: datetime


# ── Evaluations ──

class EvaluationCreate(BaseModel):
    user_id: uuid.UUID
    evaluator_id: uuid.UUID
    rating: float
    comments: str = ""


class EvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    evaluator_id: uuid.UUID
    rating: float
    comments: str
    evaluated_at: datetime
