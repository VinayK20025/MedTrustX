"""
MedTrustX Accreditation Service — Domain Entities

Five tables managing compliance frameworks: programs, standards,
checklists, uploaded evidence, and audits.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class AccreditationProgram(BaseModel):
    """An overarching program like NABH 5th Edition, JCI 7th Edition."""
    __tablename__ = "accreditation_programs"
    __table_args__ = (
        Index("ix_acc_prog_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    authority: Mapped[str] = mapped_column(String(100), nullable=False)  # nabh, jci, iso
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="in_preparation")  # in_preparation, submitted, active, expired
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Standard(BaseModel):
    """A specific standard chapter/clause under a program (e.g., AAC.1)."""
    __tablename__ = "standards"
    __table_args__ = (
        Index("ix_std_prog", "tenant_id", "program_id"),
    )

    program_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")


class Checklist(BaseModel):
    """A measurable item or objective required to satisfy a Standard."""
    __tablename__ = "checklists"
    __table_args__ = (
        Index("ix_chk_std", "tenant_id", "standard_id"),
    )

    standard_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    item: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, compliant, non_compliant, partial


class Evidence(BaseModel):
    """Document or artifact uploaded to prove compliance with a Checklist item."""
    __tablename__ = "evidence"
    __table_args__ = (
        Index("ix_evid_chk", "tenant_id", "checklist_id"),
    )

    checklist_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    document_url: Mapped[str] = mapped_column(Text, nullable=False)
    uploaded_by: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class AccreditationAudit(BaseModel):
    """Mock survey or official audit event for the Program."""
    __tablename__ = "accreditation_audits"
    __table_args__ = (
        Index("ix_aaud_prog", "tenant_id", "program_id"),
    )

    program_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    audit_type: Mapped[str] = mapped_column(String(50), nullable=False)  # internal_mock, external_official
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="scheduled")  # scheduled, conducted, passed, failed
    conducted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    findings: Mapped[str] = mapped_column(Text, nullable=True, default="")
