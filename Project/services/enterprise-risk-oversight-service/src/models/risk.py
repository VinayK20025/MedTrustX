"""
MedTrustX Enterprise Risk Oversight Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Risk(BaseModel):
    """Top-level enterprise risk entry in the central risk registry."""
    __tablename__ = "risks"
    __table_args__ = (
        Index("ix_risk_tenant_sev", "tenant_id", "severity"),
        Index("ix_risk_status", "status"),
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False) # operational, clinical, legal, financial, infra
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False) # critical, high, medium, low
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open")

class RiskAssessment(BaseModel):
    """Quantitative assessment of a specific risk entry."""
    __tablename__ = "risk_assessments"
    __table_args__ = (
        Index("ix_assess_tenant_risk", "tenant_id", "risk_id"),
    )
    risk_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    likelihood: Mapped[float] = mapped_column(Float, nullable=False)
    impact: Mapped[float] = mapped_column(Float, nullable=False)
    assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class MitigationPlan(BaseModel):
    """Action items and controls designed to reduce a specific risk."""
    __tablename__ = "mitigation_plans"
    __table_args__ = (
        Index("ix_mitig_tenant_risk", "tenant_id", "risk_id"),
    )
    risk_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    actions: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")

class RiskEvent(BaseModel):
    """Immutable audit trail of events related to a specific risk."""
    __tablename__ = "risk_events"
    __table_args__ = (
        Index("ix_revt_tenant_risk", "tenant_id", "risk_id"),
    )
    risk_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False) # identified, assessed, mitigated, resolved
    details: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
