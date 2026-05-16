"""
MedTrustX Credentialing Service — Domain Entities

Five tables governing provider qualifications: credentials, privileges,
verification workflows, privileging requests, and audit events.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Credential(BaseModel):
    """A verifiable qualification (license, board cert, degree)."""
    __tablename__ = "credentials"
    __table_args__ = (
        Index("ix_cred_user", "tenant_id", "user_id"),
        Index("ix_cred_type", "credential_type"),
        Index("ix_cred_status", "status"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    credential_type: Mapped[str] = mapped_column(String(100), nullable=False)  # medical_license, board_certification, dea, cme, degree
    issuing_authority: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    license_number: Mapped[str] = mapped_column(String(100), nullable=True, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, verified, expired, revoked
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Privilege(BaseModel):
    """A clinical privilege granted to a provider (e.g., 'perform_surgery')."""
    __tablename__ = "privileges"
    __table_args__ = (
        Index("ix_priv_user", "tenant_id", "user_id"),
        Index("ix_priv_status", "status"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    privilege_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, suspended, revoked, expired
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    scope: Mapped[str] = mapped_column(String(200), nullable=True, default="")  # department/service line scope


class CredentialVerification(BaseModel):
    """Verification record for a credential — links credential to verifier."""
    __tablename__ = "credential_verifications"

    credential_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    verifier_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, verified, rejected
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True, default="")


class PrivilegingRequest(BaseModel):
    """A request from a provider to obtain a clinical privilege."""
    __tablename__ = "privileging_requests"
    __table_args__ = (
        Index("ix_pr_user", "tenant_id", "user_id"),
        Index("ix_pr_status", "status"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    requested_privilege: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="submitted")  # submitted, under_review, approved, denied
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    justification: Mapped[str] = mapped_column(Text, nullable=True, default="")


class CredentialEvent(BaseModel):
    """Audit trail for all credentialing lifecycle events."""
    __tablename__ = "credential_events"

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
