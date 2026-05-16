"""
MedTrustX Compliance Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class Consent(BaseModel):
    __tablename__ = "consents"
    __table_args__ = (
        Index("ix_consents_tenant_patient", "tenant_id", "patient_id"),
        Index("ix_consents_status", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    consent_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="granted", server_default=text("'granted'"))
    granted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class Policy(BaseModel):
    __tablename__ = "policies"
    __table_args__ = (
        Index("ix_policies_tenant_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rules: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))


class LegalDocument(BaseModel):
    __tablename__ = "legal_documents"
    __table_args__ = (
        Index("ix_legal_docs_tenant_type", "tenant_id", "document_type"),
    )

    document_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default=text("1"))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class ComplianceCheck(BaseModel):
    __tablename__ = "compliance_checks"
    __table_args__ = (
        Index("ix_comp_checks_tenant_entity", "tenant_id", "entity_type", "entity_id"),
        Index("ix_comp_checks_status", "status"),
    )

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class Violation(BaseModel):
    __tablename__ = "violations"
    __table_args__ = (
        Index("ix_violations_tenant_type", "tenant_id", "violation_type"),
        Index("ix_violations_type", "violation_type"),
    )

    violation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open", server_default=text("'open'"))
    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
