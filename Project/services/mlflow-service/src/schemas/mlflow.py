"""
MedTrustX MLflow Service — Pydantic v2 Schemas
MLflow-compatible API surface.
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, ConfigDict


# ── Experiments ──

class ExperimentCreateRequest(BaseModel):
    name: str
    tags: Dict[str, Any] = {}


class ExperimentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    tags: Dict[str, Any]
    created_at: datetime


# ── Runs ──

class RunCreateRequest(BaseModel):
    experiment_id: uuid.UUID
    source_name: str = ""
    tags: Dict[str, Any] = {}


class RunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    experiment_id: uuid.UUID
    status: str
    started_at: datetime
    ended_at: Optional[datetime]
    source_name: Optional[str]
    artifact_uri: Optional[str]
    tags: Dict[str, Any]


# ── Metrics ──

class LogMetricRequest(BaseModel):
    run_id: uuid.UUID
    key: str
    value: float
    step: int = 0


class MetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    run_id: uuid.UUID
    key: str
    value: float
    step: int
    recorded_at: datetime


# ── Parameters ──

class LogParameterRequest(BaseModel):
    run_id: uuid.UUID
    key: str
    value: str


class ParameterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    run_id: uuid.UUID
    key: str
    value: str


# ── Model Versions ──

class ModelVersionCreateRequest(BaseModel):
    name: str
    version: str = "1"
    run_id: Optional[uuid.UUID] = None
    source: str = ""
    description: str = ""


class ModelVersionTransitionRequest(BaseModel):
    stage: str  # None, Staging, Production, Archived


class ModelVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    version: str
    stage: str
    run_id: Optional[uuid.UUID]
    source: Optional[str]
    description: Optional[str]
    created_at: datetime
