"""
MedTrustX Insurance Integration Service — Domain Entities

Seven tables covering insurers, policies, eligibility, pre-auths, claims, status updates, and remittances.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Insurer(BaseModel):
    """External insurance payer or Third-Party Administrator (TPA)."""
    __tablename__ = "insurers"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    tpa: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    api_endpoint: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")


class Policy(BaseModel):
    """Patient coverage policy details mapped to an insurer."""
    __tablename__ = "policies"
    __table_args__ = (
        Index("ix_ii_policy_num", "tenant_id", "policy_number"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    insurer_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    policy_number: Mapped[str] = mapped_column(String(100), nullable=False)
    coverage: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")


class EligibilityCheck(BaseModel):
    """Record of an Eligibility and Benefits Verification (EBV) request."""
    __tablename__ = "eligibility_checks"
    __table_args__ = (
        Index("ix_ii_elig_policy", "tenant_id", "policy_id"),
    )

    policy_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, verified, rejected
    response: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class Preauthorization(BaseModel):
    """Pre-auth requests for planned procedures."""
    __tablename__ = "preauthorizations"
    __table_args__ = (
        Index("ix_ii_preauth_enc", "tenant_id", "encounter_id"),
    )

    encounter_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    request_payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="submitted")  # submitted, approved, denied, info_required
    reference_no: Mapped[str] = mapped_column(String(100), nullable=True)


class Claim(BaseModel):
    """Submitted claims to the payer."""
    __tablename__ = "claims"
    __table_args__ = (
        Index("ix_ii_claim_enc", "tenant_id", "encounter_id"),
        Index("ix_ii_claim_status", "tenant_id", "status"),
    )

    encounter_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    insurer_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    claim_amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="created")  # created, submitted, paid, denied
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class ClaimStatusUpdate(BaseModel):
    """Chronological updates on a claim's status from the payer."""
    __tablename__ = "claim_status_updates"
    __table_args__ = (
        Index("ix_ii_status_claim", "tenant_id", "claim_id"),
    )

    claim_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    payer_status: Mapped[str] = mapped_column(String(50), nullable=False)
    internal_status: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class Remittance(BaseModel):
    """Remittance Advice (RA) / EOB details for reconciliation."""
    __tablename__ = "remittances"
    __table_args__ = (
        Index("ix_ii_remit_claim", "tenant_id", "claim_id"),
    )

    claim_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    paid_amount: Mapped[float] = mapped_column(Float, nullable=False)
    adjustments: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
