"""
MedTrustX Ethics Service — Domain Entities

Five tables managing ethical oversight: cases, reviews, committee members,
conflict of interest declarations, and ethics policies.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class EthicsCase(BaseModel):
    """A submission requesting ethical review (clinical trial, AI deployment, etc)."""
    __tablename__ = "ethics_cases"
    __table_args__ = (
        Index("ix_eth_case_type", "tenant_id", "case_type"),
        Index("ix_eth_case_status", "status"),
    )

    case_type: Mapped[str] = mapped_column(String(100), nullable=False)  # clinical, research, ai_model, patient_rights
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="submitted")  # submitted, under_review, approved, rejected
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    submitter_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)


class EthicsReview(BaseModel):
    """An individual review and decision made by a committee member on a case."""
    __tablename__ = "ethics_reviews"
    __table_args__ = (
        Index("ix_eth_rev_case", "tenant_id", "case_id"),
    )

    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    reviewer_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    decision: Mapped[str] = mapped_column(String(20), nullable=False)  # approve, reject, require_changes
    comments: Mapped[str] = mapped_column(Text, nullable=True, default="")
    reviewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class CommitteeMember(BaseModel):
    """A member appointed to the institutional ethics board."""
    __tablename__ = "committee_members"
    __table_args__ = (
        Index("ix_eth_cmte_user", "tenant_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # chair, reviewer, bioethicist
    appointed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class ConflictDeclaration(BaseModel):
    """A declared conflict of interest for a user regarding a case or generally."""
    __tablename__ = "conflict_declarations"
    __table_args__ = (
        Index("ix_eth_coi_user", "tenant_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    case_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    declaration: Mapped[str] = mapped_column(Text, nullable=False)
    declared_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class EthicsPolicy(BaseModel):
    """Institutional rules governing ethical decisions."""
    __tablename__ = "ethics_policies"
    __table_args__ = (
        Index("ix_eth_pol_name", "tenant_id", "policy_name"),
    )

    policy_name: Mapped[str] = mapped_column(String(100), nullable=False)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
