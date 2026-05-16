"""
MedTrustX Regulator Integration Service — Domain Entities

Five tables orchestrating regulators, definitions, submissions, acks, and events.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Regulator(BaseModel):
    """External regulatory authority or accreditation body."""
    __tablename__ = "regulators"
    __table_args__ = (
        Index("ix_ri_regulator_type", "tenant_id", "authority_type"),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    authority_type: Mapped[str] = mapped_column(String(100), nullable=False)  # health_ministry, registry, accreditation
    api_endpoint: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")


class ReportDefinition(BaseModel):
    """Configuration schemas for reports required by a regulator."""
    __tablename__ = "report_definitions"
    __table_args__ = (
        Index("ix_ri_report_def", "tenant_id", "regulator_id", "report_type"),
    )

    regulator_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    report_type: Mapped[str] = mapped_column(String(100), nullable=False)  # disease_registry, utilization_report
    schema: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    frequency: Mapped[str] = mapped_column(String(50), nullable=False, default="ad_hoc")  # daily, weekly, ad_hoc


class Submission(BaseModel):
    """A specific data payload transmitted to the regulator."""
    __tablename__ = "submissions"
    __table_args__ = (
        Index("ix_ri_submission_status", "tenant_id", "status"),
        Index("ix_ri_submission_type", "tenant_id", "report_type"),
    )

    regulator_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    report_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="prepared")  # prepared, submitted, failed
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class Acknowledgment(BaseModel):
    """Receipt and validation status from the external regulator."""
    __tablename__ = "acknowledgments"
    __table_args__ = (
        Index("ix_ri_ack_submission", "tenant_id", "submission_id"),
    )

    submission_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    ack_status: Mapped[str] = mapped_column(String(20), nullable=False)  # accepted, rejected, partial
    response: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class RegulatoryEvent(BaseModel):
    """Platform signals mapped to regulatory obligations."""
    __tablename__ = "regulatory_events"
    __table_args__ = (
        Index("ix_ri_event_reg", "tenant_id", "regulator_id"),
    )

    regulator_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
