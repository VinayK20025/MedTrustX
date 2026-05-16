"""
MedTrustX TF Serving Service — Pydantic v2 Schemas
TF-Serving compatible predict/classify/regress API shapes.
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Predict ──

class PredictRequest(BaseModel):
    instances: List[Dict[str, Any]]
    signature_name: str = "serving_default"


class PredictResponse(BaseModel):
    model_name: str
    model_version: str
    predictions: List[Dict[str, Any]]
    latency_ms: float


# ── Classify / Regress ──

class ClassifyRequest(BaseModel):
    instances: List[Dict[str, Any]]


class ClassifyResponse(BaseModel):
    model_name: str
    model_version: str
    results: List[Dict[str, Any]]
    latency_ms: float


class RegressRequest(BaseModel):
    instances: List[Dict[str, Any]]


class RegressResponse(BaseModel):
    model_name: str
    model_version: str
    results: List[Dict[str, Any]]
    latency_ms: float


# ── Model Info ──

class ModelInfoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    base_path: str
    model_platform: str
    active_version: str
    status: str
    config: Dict[str, Any]


class ModelVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_config_id: uuid.UUID
    version: str
    artifact_path: str
    status: str


# ── Inference Log ──

class InferenceLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_name: str
    model_version: str
    entity_id: Optional[str]
    latency_ms: float
    input_summary: Dict[str, Any]
    output_summary: Dict[str, Any]
    created_at: datetime


# ── A/B Experiment ──

class ABExperimentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_name: str
    version_a: str
    version_b: str
    traffic_split: float
    status: str
    results: Dict[str, Any]
