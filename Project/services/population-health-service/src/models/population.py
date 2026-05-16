"""
MedTrustX Population Health Service — Domain Entities

Five tables for population-level intelligence: cohort definitions,
membership, risk profiles, care gaps, and intervention tracking.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Population(BaseModel):
    """A defined patient cohort (e.g. diabetics over 65, high-risk cardiac)."""
    __tablename__ = "populations"
    __table_args__ = (
        Index("ix_pop_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    criteria: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class PopulationMember(BaseModel):
    """A patient assigned to a population cohort with a risk score."""
    __tablename__ = "population_members"
    __table_args__ = (
        Index("ix_pm_pop", "tenant_id", "population_id"),
        Index("ix_pm_patient", "patient_id"),
    )

    population_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class RiskProfile(BaseModel):
    """Per-patient risk stratification record."""
    __tablename__ = "risk_profiles"
    __table_args__ = (
        Index("ix_rp_patient", "tenant_id", "patient_id"),
        Index("ix_rp_score", "risk_score"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    risk_type: Mapped[str] = mapped_column(String(100), nullable=False)  # cardiac, diabetic, readmission, etc.
    risk_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    factors: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class CareGap(BaseModel):
    """An identified gap in a patient's preventive care."""
    __tablename__ = "care_gaps"
    __table_args__ = (
        Index("ix_cg_patient", "tenant_id", "patient_id"),
        Index("ix_cg_status", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    gap_type: Mapped[str] = mapped_column(String(100), nullable=False)  # missed_screening, overdue_vaccination, etc.
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")  # open, addressed, closed
    identified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    details: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class Intervention(BaseModel):
    """A population-level intervention (outreach, screening campaign, etc.)."""
    __tablename__ = "interventions"
    __table_args__ = (
        Index("ix_intv_pop", "tenant_id", "population_id"),
    )

    population_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    intervention_type: Mapped[str] = mapped_column(String(100), nullable=False)  # screening, outreach, vaccination, etc.
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="planned")  # planned, active, completed
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
