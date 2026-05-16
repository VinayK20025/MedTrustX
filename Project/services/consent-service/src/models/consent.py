"""
MedTrustX Consent Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Integer, text
from sqlalchemy.dialects.postgresql import UUID, TEXT, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class Consent(BaseModel):
    __tablename__ = "consents"
    __table_args__ = (
        Index("ix_consent_tenant_patient", "tenant_id", "patient_id"),
        Index("ix_consent_type", "consent_type"),
        Index("ix_consent_status", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    consent_type: Mapped[str] = mapped_column(String(100), nullable=False)
    scope: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="granted", server_default=text("'granted'"))
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
    revoked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class ConsentRecord(BaseModel):
    __tablename__ = "consent_records"
    __table_args__ = (
        Index("ix_cons_rec_consent_id", "consent_id"),
    )

    consent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    document_url: Mapped[str] = mapped_column(TEXT, nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default=text("1"))
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class ConsentLog(BaseModel):
    __tablename__ = "consent_logs"
    __table_args__ = (
        Index("ix_cons_log_consent_id", "consent_id"),
    )

    consent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    performed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class ConsentValidation(BaseModel):
    __tablename__ = "consent_validations"
    __table_args__ = (
        Index("ix_cons_val_tenant_patient", "tenant_id", "patient_id"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    resource: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    result: Mapped[str] = mapped_column(String(20), nullable=False)
    validated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class ConsentPolicy(BaseModel):
    __tablename__ = "consent_policies"

    consent_type: Mapped[str] = mapped_column(String(100), nullable=False)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
