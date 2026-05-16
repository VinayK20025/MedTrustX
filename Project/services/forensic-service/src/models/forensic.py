"""
MedTrustX Forensic Service — Domain Entities

Five tables managing Medico-Legal Cases (MLC), evidence, custody logs, reports, and external requests.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class MLCCase(BaseModel):
    """Medico-Legal Case tracking."""
    __tablename__ = "mlc_cases"
    __table_args__ = (
        Index("ix_for_mlc_patient", "tenant_id", "patient_id"),
        Index("ix_for_mlc_status", "tenant_id", "status"),
        Index("ix_for_mlc_type", "tenant_id", "case_type"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    case_type: Mapped[str] = mapped_column(String(100), nullable=False)  # assault, accident, poisoning, unknown
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")  # open, under_investigation, closed
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class EvidenceItem(BaseModel):
    """Physical or digital evidence collected for an MLC."""
    __tablename__ = "evidence_items"
    __table_args__ = (
        Index("ix_for_evidence_mlc", "tenant_id", "mlc_case_id"),
    )

    mlc_case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    item_type: Mapped[str] = mapped_column(String(100), nullable=False)  # clothing, biological_sample, weapon
    description: Mapped[str] = mapped_column(Text, nullable=False)
    collected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class CustodyLog(BaseModel):
    """Strict chain of custody tracking for evidence."""
    __tablename__ = "custody_logs"
    __table_args__ = (
        Index("ix_for_custody_evidence", "tenant_id", "evidence_id"),
    )

    evidence_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # collected, transferred, examined, stored, released
    performed_by: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    performed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class ForensicReport(BaseModel):
    """Final examination reports linked to an MLC."""
    __tablename__ = "forensic_reports"
    __table_args__ = (
        Index("ix_for_report_mlc", "tenant_id", "mlc_case_id"),
    )

    mlc_case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    findings: Mapped[str] = mapped_column(Text, nullable=False)


class ExternalRequest(BaseModel):
    """Requests from police, courts, or regulatory bodies."""
    __tablename__ = "external_requests"
    __table_args__ = (
        Index("ix_for_req_mlc", "tenant_id", "mlc_case_id"),
    )

    mlc_case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    authority: Mapped[str] = mapped_column(String(100), nullable=False)  # local_police, high_court
    request_type: Mapped[str] = mapped_column(String(100), nullable=False)  # report_copy, evidence_transfer
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, fulfilled, rejected
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
