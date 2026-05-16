"""
MedTrustX Quality Management Service — Domain Entities

Five tables managing quality operations: metrics, incidents, root cause analyses (RCA),
audits, and continuous improvement plans.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class QualityMetric(BaseModel):
    """A clinical quality indicator observation (e.g., infection rate, mortality)."""
    __tablename__ = "quality_metrics"
    __table_args__ = (
        Index("ix_qm_name", "tenant_id", "metric_name"),
    )

    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    context: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class Incident(BaseModel):
    """An adverse event, near miss, or safety incident."""
    __tablename__ = "incidents"
    __table_args__ = (
        Index("ix_inc_type_sev", "tenant_id", "incident_type", "severity"),
        Index("ix_inc_status", "status"),
    )

    incident_type: Mapped[str] = mapped_column(String(100), nullable=False)  # near_miss, adverse_event, protocol_breach
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="low")  # low, medium, high, critical
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="reported")  # reported, under_investigation, resolved, closed
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    reporter_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True)


class RootCauseAnalysis(BaseModel):
    """RCA workflow for a specific incident."""
    __tablename__ = "root_cause_analysis"
    __table_args__ = (
        Index("ix_rca_incident", "tenant_id", "incident_id"),
    )

    incident_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    findings: Mapped[str] = mapped_column(Text, nullable=True, default="")
    actions: Mapped[str] = mapped_column(Text, nullable=True, default="")  # Corrective/preventative actions
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="in_progress")


class Audit(BaseModel):
    """Internal or external quality audit record."""
    __tablename__ = "audits"
    __table_args__ = (
        Index("ix_aud_type", "tenant_id", "audit_type"),
    )

    audit_type: Mapped[str] = mapped_column(String(100), nullable=False)  # internal, jci, nabh, iso
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="planned")  # planned, in_progress, completed
    conducted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    findings_summary: Mapped[str] = mapped_column(Text, nullable=True, default="")


class ImprovementPlan(BaseModel):
    """Continuous Quality Improvement (CQI) initiative."""
    __tablename__ = "improvement_plans"
    __table_args__ = (
        Index("ix_ip_status", "tenant_id", "status"),
    )

    plan_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # proposed, active, completed, abandoned
    target_metric: Mapped[str] = mapped_column(String(100), nullable=True, default="")
