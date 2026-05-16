"""
MedTrustX Evidence Management Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class EvidenceItem(BaseModel):
    """Core evidence record tracking secure files (video, documents)."""
    __tablename__ = "evidence_items"
    __table_args__ = (
        Index("ix_evidence_tenant_case", "tenant_id", "case_id"),
    )
    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False) # cctv_footage, legal_doc, log_dump
    file_path: Mapped[str] = mapped_column(String(255), nullable=False)
    hash: Mapped[str] = mapped_column(String(255), nullable=False) # SHA-256 for integrity verification

class CustodyLog(BaseModel):
    """Immutable chain-of-custody tracking for evidence lifecycle."""
    __tablename__ = "custody_logs"
    __table_args__ = (
        Index("ix_custody_tenant_evidence", "tenant_id", "evidence_id"),
    )
    evidence_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False) # uploaded, accessed, transferred, sealed
    performed_by: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class EvidenceMetadata(BaseModel):
    """Extended attributes, AI classifications, and relevance scores for evidence."""
    __tablename__ = "evidence_metadata"
    __table_args__ = (
        Index("ix_ev_meta_tenant_evidence", "tenant_id", "evidence_id"),
    )
    evidence_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default={})

class AccessRecord(BaseModel):
    """Strict audit log for who viewed or downloaded the evidence."""
    __tablename__ = "access_records"
    __table_args__ = (
        Index("ix_access_tenant_user", "tenant_id", "user_id"),
        Index("ix_access_tenant_evidence", "tenant_id", "evidence_id"),
    )
    evidence_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False) # view, download
