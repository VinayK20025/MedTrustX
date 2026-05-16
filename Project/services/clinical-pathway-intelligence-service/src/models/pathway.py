"""
MedTrustX Clinical Pathway Intelligence Service — Domain Entities

Postgres abstractions for clinical pathways, steps, patient journeys, and variances.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class ClinicalPathway(BaseModel):
    """A standardized clinical care pathway definition."""
    __tablename__ = "clinical_pathways"
    __table_args__ = (
        Index("ix_pathway_tenant_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class PathwayStep(BaseModel):
    """An ordered step within a clinical pathway."""
    __tablename__ = "pathway_steps"
    __table_args__ = (
        Index("ix_step_pathway", "tenant_id", "pathway_id"),
    )

    pathway_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    step_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class PatientJourney(BaseModel):
    """Tracks a patient's progress through a clinical pathway."""
    __tablename__ = "patient_journeys"
    __table_args__ = (
        Index("ix_journey_patient", "tenant_id", "patient_id"),
        Index("ix_journey_status", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    pathway_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    current_step: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")  # active, completed, paused, deviated


class PathwayVariance(BaseModel):
    """Records deviations from standard clinical pathway expectations."""
    __tablename__ = "pathway_variances"
    __table_args__ = (
        Index("ix_variance_journey", "tenant_id", "journey_id"),
    )

    journey_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    expected_step: Mapped[int] = mapped_column(Integer, nullable=False)
    actual_step: Mapped[int] = mapped_column(Integer, nullable=False)
    variance_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
