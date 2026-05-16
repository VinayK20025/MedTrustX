"""
MedTrustX Risk Management Service — Domain Entities

Five tables orchestrating risk registers, scoring models, mitigation plans, and indicators.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Risk(BaseModel):
    """The core risk register entity."""
    __tablename__ = "risks"
    __table_args__ = (
        Index("ix_rm_risk_type", "tenant_id", "risk_type"),
        Index("ix_rm_risk_score", "tenant_id", "score"),
        Index("ix_rm_risk_status", "tenant_id", "status"),
    )

    risk_type: Mapped[str] = mapped_column(String(100), nullable=False)  # clinical, operational, financial, security
    description: Mapped[str] = mapped_column(Text, nullable=False)
    likelihood: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # 1-5 scale
    impact: Mapped[int] = mapped_column(Integer, nullable=False, default=1)      # 1-5 scale
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=1)       # likelihood * impact (1-25)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="identified")  # identified, assessed, mitigated, closed


class RiskAssessment(BaseModel):
    """Periodic or triggered risk assessments for a specific risk."""
    __tablename__ = "risk_assessments"
    __table_args__ = (
        Index("ix_rm_assess_risk", "tenant_id", "risk_id"),
    )

    risk_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    assessed_by: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    assessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class MitigationPlan(BaseModel):
    """Corrective actions to reduce risk score."""
    __tablename__ = "mitigation_plans"
    __table_args__ = (
        Index("ix_rm_mitig_risk", "tenant_id", "risk_id"),
    )

    risk_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    actions: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list, server_default=text("'[]'::jsonb"))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="planned")  # planned, active, completed


class RiskIndicator(BaseModel):
    """Dynamic key risk indicators (KRIs) tracking real-time platform signals."""
    __tablename__ = "risk_indicators"
    __table_args__ = (
        Index("ix_rm_indic_name", "tenant_id", "indicator_name"),
    )

    indicator_name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class RiskEvent(BaseModel):
    """Events indicating risk changes or escalations."""
    __tablename__ = "risk_events"
    __table_args__ = (
        Index("ix_rm_event_type", "tenant_id", "event_type"),
    )

    risk_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
