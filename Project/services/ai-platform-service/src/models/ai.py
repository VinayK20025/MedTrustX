"""
MedTrustX AI Platform Service — Domain Entities

Five tables covering the full ML lifecycle: model registry, feature store,
inference results, training jobs, and feedback for continuous learning.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class AIModel(BaseModel):
    """Registered ML model in the model registry."""
    __tablename__ = "models"
    __table_args__ = (
        Index("ix_model_name_ver", "tenant_id", "model_name", "version"),
    )

    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False, default="0.1.0")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")  # draft, training, active, archived
    metadata_blob: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class FeatureSet(BaseModel):
    """Pre-computed feature vectors tied to a domain entity."""
    __tablename__ = "features"
    __table_args__ = (
        Index("ix_feature_entity", "tenant_id", "entity_id"),
    )

    entity_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    feature_vector: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class AIPrediction(BaseModel):
    """Inference output produced by a model for a given entity."""
    __tablename__ = "predictions"
    __table_args__ = (
        Index("ix_pred_model", "tenant_id", "model_id"),
        Index("ix_pred_entity", "tenant_id", "entity_id"),
    )

    model_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    output: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)


class TrainingJob(BaseModel):
    """Record of a model training run."""
    __tablename__ = "training_jobs"

    model_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="queued")  # queued, running, completed, failed
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    hyperparams: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    metrics: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class PredictionFeedback(BaseModel):
    """Ground-truth feedback on a prior prediction for model retraining."""
    __tablename__ = "feedback"
    __table_args__ = (
        Index("ix_fb_pred", "prediction_id"),
    )

    prediction_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    actual_outcome: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
