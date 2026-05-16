"""
MedTrustX MLflow Service — Domain Entities

Five tables modelling the MLflow lifecycle: experiments, training runs,
run metrics, run parameters, and the registered model version registry.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Experiment(BaseModel):
    """A logical grouping of training runs."""
    __tablename__ = "experiments"
    __table_args__ = (
        Index("ix_exp_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True, default="")
    tags: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class Run(BaseModel):
    """A single training execution within an experiment."""
    __tablename__ = "runs"
    __table_args__ = (
        Index("ix_run_exp", "tenant_id", "experiment_id"),
        Index("ix_run_status", "status"),
    )

    experiment_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="RUNNING")  # RUNNING, FINISHED, FAILED, KILLED
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    source_name: Mapped[str] = mapped_column(String(200), nullable=True, default="")
    artifact_uri: Mapped[str] = mapped_column(String(500), nullable=True, default="")
    tags: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class RunMetric(BaseModel):
    """A recorded metric data point for a run (loss, accuracy, etc.)."""
    __tablename__ = "metrics"
    __table_args__ = (
        Index("ix_metric_run", "run_id"),
        Index("ix_metric_key", "key"),
    )

    run_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    key: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    step: Mapped[int] = mapped_column(nullable=False, default=0)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class RunParameter(BaseModel):
    """A hyperparameter key-value pair logged for a run."""
    __tablename__ = "parameters"
    __table_args__ = (
        Index("ix_param_run", "run_id"),
    )

    run_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    key: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False, default="")


class RegisteredModel(BaseModel):
    """A versioned model in the model registry."""
    __tablename__ = "models"
    __table_args__ = (
        Index("ix_model_name_ver", "tenant_id", "name", "version"),
        Index("ix_model_stage", "stage"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False, default="1")
    stage: Mapped[str] = mapped_column(String(20), nullable=False, default="None")  # None, Staging, Production, Archived
    run_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    source: Mapped[str] = mapped_column(String(500), nullable=True, default="")
    description: Mapped[str] = mapped_column(Text, nullable=True, default="")
