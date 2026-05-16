"""
MedTrustX Medical Records Service — Domain Entities

Tables:
  medical_records     – Metadata and indexing for a medical artifact
  record_documents    – Links to unstructured files (MinIO/S3)
  record_audit_logs   – Mandatory logging of access/modifications to PHI
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class MedicalRecord(BaseModel):
    """
    Central metadata index for any medical artifact (lab, imaging, note).
    """

    __tablename__ = "medical_records"
    __table_args__ = (
        Index("ix_medical_records_timeline", "tenant_id", "patient_id", "created_at"),
        Index("ix_medical_records_type", "tenant_id", "record_type"),
        {"comment": "Core medical record index"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Optional link to a specific encounter",
    )

    record_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="discharge_summary | lab_report | imaging | progress_note",
    )
    
    source_service: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="clinical | diagnostics | pharmacy | nursing",
    )
    
    reference_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Link to the source entity ID in the originating service",
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    summary_data: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Optional structured JSON summary for fast retrieval without opening document",
    )

    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default=text("1"),
    )

    # ── Relationships ───────────────────────────────────────────
    documents: Mapped[List["RecordDocument"]] = relationship(
        "RecordDocument",
        back_populates="record",
        cascade="all, delete-orphan",
    )
    audit_logs: Mapped[List["RecordAuditLog"]] = relationship(
        "RecordAuditLog",
        back_populates="record",
        cascade="all, delete-orphan",
    )


class RecordDocument(BaseModel):
    """
    References to physical unstructured files stored in Object Storage.
    """

    __tablename__ = "record_documents"
    __table_args__ = (
        {"comment": "Object storage references"},
    )

    record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("medical_records.id", ondelete="CASCADE"),
        nullable=False,
    )

    file_url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="s3://bucket/path/to/file.pdf",
    )
    
    file_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="application/pdf | application/dicom",
    )
    
    file_size_bytes: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    # ── Relationships ───────────────────────────────────────────
    record: Mapped["MedicalRecord"] = relationship(
        "MedicalRecord", back_populates="documents"
    )


class RecordAuditLog(BaseModel):
    """
    Mandatory compliance tracking for PHI access and modification.
    """

    __tablename__ = "record_audit_logs"
    __table_args__ = (
        Index("ix_audit_record", "tenant_id", "record_id"),
        {"comment": "HIPAA compliance access logs"},
    )

    record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("medical_records.id", ondelete="CASCADE"),
        nullable=False,
    )

    action: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="created | updated | accessed | exported",
    )
    
    performed_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    ip_address: Mapped[Optional[str]] = mapped_column(
        String(45),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    record: Mapped["MedicalRecord"] = relationship(
        "MedicalRecord", back_populates="audit_logs"
    )
