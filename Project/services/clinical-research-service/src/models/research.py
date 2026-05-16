"""
MedTrustX Clinical Research Service — Domain Entities

Five tables covering the research lifecycle: studies, participants,
cohorts, collected research data, and study-level audit events.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Study(BaseModel):
    """A clinical trial or observational study."""
    __tablename__ = "studies"
    __table_args__ = (
        Index("ix_study_status", "tenant_id", "status"),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    study_type: Mapped[str] = mapped_column(String(50), nullable=False, default="observational")  # observational, interventional, retrospective
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")  # draft, recruiting, active, completed, terminated
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    protocol: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class StudyParticipant(BaseModel):
    """A patient enrolled in a study."""
    __tablename__ = "study_participants"
    __table_args__ = (
        Index("ix_sp_study", "tenant_id", "study_id"),
        Index("ix_sp_patient", "patient_id"),
    )

    study_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="enrolled")  # screened, enrolled, active, withdrawn, completed
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class Cohort(BaseModel):
    """A reusable patient cohort defined by selection criteria."""
    __tablename__ = "cohorts"
    __table_args__ = (
        Index("ix_cohort_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    criteria: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class ResearchData(BaseModel):
    """Collected research data points for a study participant."""
    __tablename__ = "research_data"
    __table_args__ = (
        Index("ix_rd_study", "tenant_id", "study_id"),
        Index("ix_rd_patient", "patient_id"),
    )

    study_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    collected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class StudyEvent(BaseModel):
    """Audit / lifecycle events for a study."""
    __tablename__ = "study_events"
    __table_args__ = (
        Index("ix_se_study", "tenant_id", "study_id"),
    )

    study_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
