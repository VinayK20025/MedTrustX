"""
MedTrustX TF Serving Service — Domain Entities

Five tables for the inference control plane: model configs, version routing,
inference audit logs, health checks, and A/B experiment tracking.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class ServingModelConfig(BaseModel):
    """Registered model available for serving."""
    __tablename__ = "serving_model_configs"
    __table_args__ = (
        Index("ix_smc_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    base_path: Mapped[str] = mapped_column(String(500), nullable=False)
    model_platform: Mapped[str] = mapped_column(String(50), nullable=False, default="tensorflow")
    active_version: Mapped[str] = mapped_column(String(20), nullable=False, default="1")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="available")  # available, loading, error
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class ModelVersion(BaseModel):
    """A specific version of a served model."""
    __tablename__ = "model_versions"
    __table_args__ = (
        Index("ix_mv_model", "tenant_id", "model_config_id"),
    )

    model_config_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    artifact_path: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ready")  # ready, loading, deprecated


class InferenceLog(BaseModel):
    """Audit record of an inference request."""
    __tablename__ = "inference_logs"
    __table_args__ = (
        Index("ix_il_model", "tenant_id", "model_name"),
    )

    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    model_version: Mapped[str] = mapped_column(String(20), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(100), nullable=True)
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    input_summary: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    output_summary: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class ModelHealthCheck(BaseModel):
    """Periodic health / canary check result for a served model."""
    __tablename__ = "model_health_checks"

    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="healthy")
    latency_p99_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class ABExperiment(BaseModel):
    """A/B test configuration routing traffic between model versions."""
    __tablename__ = "ab_experiments"
    __table_args__ = (
        Index("ix_ab_model", "tenant_id", "model_name"),
    )

    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    version_a: Mapped[str] = mapped_column(String(20), nullable=False)
    version_b: Mapped[str] = mapped_column(String(20), nullable=False)
    traffic_split: Mapped[float] = mapped_column(Float, nullable=False, default=0.5)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, completed
    results: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
