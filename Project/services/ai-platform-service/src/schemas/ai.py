"""
MedTrustX AI Platform Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, ConfigDict


# ── Predict ──

class PredictRequest(BaseModel):
    model_name: str
    entity_id: uuid.UUID
    features: Dict[str, Any] = {}


class PredictResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_id: uuid.UUID
    entity_id: uuid.UUID
    output: Dict[str, Any]
    confidence: float


# ── Models ──

class ModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_name: str
    version: str
    status: str
    metadata_blob: Dict[str, Any]


# ── Training ──

class TrainRequest(BaseModel):
    model_name: str
    hyperparams: Dict[str, Any] = {}


class TrainingJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    model_id: uuid.UUID
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    hyperparams: Dict[str, Any]
    metrics: Dict[str, Any]


# ── Predictions ──

class PredictionHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    entity_id: uuid.UUID
    output: Dict[str, Any]
    confidence: float
    created_at: datetime


# ── Feedback ──

class FeedbackRequest(BaseModel):
    prediction_id: uuid.UUID
    actual_outcome: Dict[str, Any]


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    prediction_id: uuid.UUID
    actual_outcome: Dict[str, Any]
    recorded_at: datetime
