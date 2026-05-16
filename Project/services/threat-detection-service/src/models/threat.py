"""
MedTrustX Threat Detection Service — Domain Entities

Five core tables modelling threat intelligence, behavioural baselines,
risk scores, ML model metadata, and actionable threat alerts.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class ThreatEvent(BaseModel):
    """Raw anomaly detections emitted by the inference pipeline."""
    __tablename__ = "threat_events"
    __table_args__ = (
        Index("ix_threat_event_entity", "tenant_id", "entity_id"),
        Index("ix_threat_event_severity", "severity"),
    )

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # user, service, device
    anomaly_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="low")
    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    event_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class BehaviorProfile(BaseModel):
    """Per-entity behavioural baseline used for anomaly comparison."""
    __tablename__ = "behavior_profiles"
    __table_args__ = (
        Index("ix_behavior_entity", "tenant_id", "entity_id", unique=True),
    )

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False, default="user")
    baseline: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class RiskScore(BaseModel):
    """Dynamic risk score for a given entity, updated by analysis runs."""
    __tablename__ = "risk_scores"
    __table_args__ = (
        Index("ix_risk_entity", "tenant_id", "entity_id", unique=True),
    )

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    factors: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class AnomalyModel(BaseModel):
    """Registry entry for a trained ML model used for inference."""
    __tablename__ = "anomaly_models"
    __table_args__ = (
        Index("ix_model_name", "tenant_id", "model_name"),
    )

    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False, default="0.1.0")
    metadata_blob: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class ThreatAlert(BaseModel):
    """Actionable alert surfaced to SOC / incident teams."""
    __tablename__ = "threat_alerts"
    __table_args__ = (
        Index("ix_alert_severity", "tenant_id", "severity"),
    )

    threat_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")  # open, investigating, resolved
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    alert_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
