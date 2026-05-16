"""
MedTrustX Incident Management Service — Domain Entities

Five tables orchestrating incidents, updates, assignments, playbooks, and RCA.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Incident(BaseModel):
    """A detected or reported clinical, operational, or security incident."""
    __tablename__ = "incidents"
    __table_args__ = (
        Index("ix_inc_severity", "tenant_id", "severity"),
        Index("ix_inc_status", "tenant_id", "status"),
        Index("ix_inc_type", "tenant_id", "incident_type"),
    )

    incident_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)  # low, medium, high, critical
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")  # open, investigating, resolved, closed
    source: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., SIEM, clinical-service, manual


class IncidentUpdate(BaseModel):
    """Chronological updates and notes for an active incident."""
    __tablename__ = "incident_updates"
    __table_args__ = (
        Index("ix_inc_upd_inc", "tenant_id", "incident_id"),
    )

    incident_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False)
    updated_by: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)


class IncidentAssignment(BaseModel):
    """Mapping of responders/investigators assigned to an incident."""
    __tablename__ = "incident_assignments"
    __table_args__ = (
        Index("ix_inc_assgn_inc", "tenant_id", "incident_id"),
        Index("ix_inc_assgn_user", "tenant_id", "assigned_to"),
    )

    incident_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    assigned_to: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class Playbook(BaseModel):
    """Standardized response procedures for specific incident types."""
    __tablename__ = "playbooks"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    steps: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list, server_default=text("'[]'::jsonb"))


class RootCauseAnalysis(BaseModel):
    """Post-incident analysis findings and corrective actions."""
    __tablename__ = "root_cause_analysis"
    __table_args__ = (
        Index("ix_inc_rca_inc", "tenant_id", "incident_id", unique=True),
    )

    incident_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    findings: Mapped[str] = mapped_column(Text, nullable=False)
    actions: Mapped[str] = mapped_column(Text, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
