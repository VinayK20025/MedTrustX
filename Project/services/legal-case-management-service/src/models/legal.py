"""
MedTrustX Legal Case Management Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class LegalCase(BaseModel):
    """Core entity for legal matters, litigation, or regulatory inquiries."""
    __tablename__ = "legal_cases"
    __table_args__ = (
        Index("ix_case_tenant_status", "tenant_id", "status"),
    )
    case_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    type: Mapped[str] = mapped_column(String(100), nullable=False) # litigation, compliance, HR
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open")

class CaseDocument(BaseModel):
    """Evidence, filings, and legal records attached to a case."""
    __tablename__ = "case_documents"
    __table_args__ = (
        Index("ix_doc_tenant_case", "tenant_id", "case_id"),
    )
    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    document_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_path: Mapped[str] = mapped_column(String(255), nullable=False)

class CaseTask(BaseModel):
    """Workflows and actionable steps required for case progression."""
    __tablename__ = "case_tasks"
    __table_args__ = (
        Index("ix_task_tenant_case", "tenant_id", "case_id"),
        Index("ix_task_assigned", "assigned_to"),
    )
    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    task_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    assigned_to: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)

class ComplianceRecord(BaseModel):
    """Tracking of specific regulatory adherence mapped to cases."""
    __tablename__ = "compliance_records"
    __table_args__ = (
        Index("ix_comp_tenant_case", "tenant_id", "case_id"),
    )
    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    regulation: Mapped[str] = mapped_column(String(255), nullable=False) # HIPAA, GDPR
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="review")
