"""
MedTrustX RCM Service — Domain Entities

Tables:
  claims         – Formatted insurance claims linked to an invoice
  claim_items    – Explicit line items attached to a claim
  adjudications  – External payer responses (approval vs rejection breakdowns)
  reimbursements – Physical cash realizations against a claim
  denials        – Explanations for rejected claims
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class Claim(BaseModel):
    """
    An insurance claim requesting payment for medical services.
    """

    __tablename__ = "claims"
    __table_args__ = (
        Index("ix_claims_tenant_invoice", "tenant_id", "invoice_id"),
        Index("ix_claims_status", "tenant_id", "status", "submitted_at"),
        {"comment": "Insurance claims"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Link back to billing-service",
    )

    insurer: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    claim_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0.00,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="draft",
        server_default=text("'draft'"),
        comment="draft | submitted | processing | adjudicated | paid | denied",
    )

    submitted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    items: Mapped[List["ClaimItem"]] = relationship(
        "ClaimItem", back_populates="claim", cascade="all, delete-orphan"
    )
    adjudication: Mapped[Optional["Adjudication"]] = relationship(
        "Adjudication", back_populates="claim", uselist=False
    )
    reimbursements: Mapped[List["Reimbursement"]] = relationship(
        "Reimbursement", back_populates="claim", cascade="all, delete-orphan"
    )
    denial: Mapped[Optional["Denial"]] = relationship(
        "Denial", back_populates="claim", uselist=False
    )


class ClaimItem(BaseModel):
    """
    Specific services billed within a claim.
    """

    __tablename__ = "claim_items"
    __table_args__ = (
        Index("ix_claim_items_claim", "tenant_id", "claim_id"),
        {"comment": "Line items for an insurance claim"},
    )

    claim_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("claims.id", ondelete="CASCADE"),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        server_default=text("'pending'"),
        comment="pending | approved | denied",
    )

    # ── Relationships ───────────────────────────────────────────
    claim: Mapped["Claim"] = relationship("Claim", back_populates="items")


class Adjudication(BaseModel):
    """
    The payer's response breaking down what was approved vs rejected.
    """

    __tablename__ = "adjudications"
    __table_args__ = (
        Index("ix_adjudications_claim", "tenant_id", "claim_id", unique=True),
        {"comment": "Payer processing results"},
    )

    claim_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("claims.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    approved_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0.00,
    )

    rejected_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0.00,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="fully_approved | partially_approved | completely_rejected",
    )

    processed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    # ── Relationships ───────────────────────────────────────────
    claim: Mapped["Claim"] = relationship("Claim", back_populates="adjudication")


class Reimbursement(BaseModel):
    """
    Actual cash received from the payer.
    """

    __tablename__ = "reimbursements"
    __table_args__ = (
        Index("ix_reimbursements_claim", "tenant_id", "claim_id"),
        {"comment": "Actual cash realizations from insurers"},
    )

    claim_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("claims.id", ondelete="CASCADE"),
        nullable=False,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    payment_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="cleared",
        server_default=text("'cleared'"),
        comment="pending | cleared | bounced",
    )

    # ── Relationships ───────────────────────────────────────────
    claim: Mapped["Claim"] = relationship("Claim", back_populates="reimbursements")


class Denial(BaseModel):
    """
    Records reasons for claim rejection, supporting resubmission workflows.
    """

    __tablename__ = "denials"
    __table_args__ = (
        Index("ix_denials_claim", "tenant_id", "claim_id", unique=True),
        {"comment": "Reasons for claim rejection"},
    )

    claim_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("claims.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="open",
        server_default=text("'open'"),
        comment="open | appealed | resolved",
    )

    # ── Relationships ───────────────────────────────────────────
    claim: Mapped["Claim"] = relationship("Claim", back_populates="denial")
