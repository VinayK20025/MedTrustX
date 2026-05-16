"""
MedTrustX Litigation Tracking Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Litigation(BaseModel):
    """Core tracking entity for a specific legal proceeding."""
    __tablename__ = "litigations"
    __table_args__ = (
        Index("ix_litigation_tenant_case", "tenant_id", "case_id"),
        Index("ix_litigation_status", "status"),
    )
    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    court_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="filed")
    filed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

class Hearing(BaseModel):
    """Scheduled court dates and hearing proceedings."""
    __tablename__ = "hearings"
    __table_args__ = (
        Index("ix_hearing_tenant_lit", "tenant_id", "litigation_id"),
        Index("ix_hearing_date", "hearing_date"),
    )
    litigation_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    hearing_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="scheduled")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

class LegalParty(BaseModel):
    """Tracking of plaintiffs, defendants, and legal representation."""
    __tablename__ = "legal_parties"
    __table_args__ = (
        Index("ix_party_tenant_lit", "tenant_id", "litigation_id"),
    )
    litigation_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    party_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(100), nullable=False) # plaintiff, defendant, counsel

class LitigationUpdate(BaseModel):
    """Immutable audit log of updates to the litigation timeline."""
    __tablename__ = "litigation_updates"
    __table_args__ = (
        Index("ix_litupdate_tenant_lit", "tenant_id", "litigation_id"),
    )
    litigation_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    update_type: Mapped[str] = mapped_column(String(100), nullable=False) # status_change, document_filed
    details: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
