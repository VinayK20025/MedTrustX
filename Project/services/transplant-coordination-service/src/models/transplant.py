"""
MedTrustX Transplant Coordination Service — Domain Entities

Five tables managing donors, recipients, waitlists, matches, and transplant events.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Donor(BaseModel):
    """Registered organ donors."""
    __tablename__ = "donors"
    __table_args__ = (
        Index("ix_tc_donor_status", "tenant_id", "status"),
    )

    donor_type: Mapped[str] = mapped_column(String(50), nullable=False)  # living, deceased
    blood_group: Mapped[str] = mapped_column(String(10), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="registered")  # registered, active, matched, completed
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class Recipient(BaseModel):
    """Patients needing organ transplants."""
    __tablename__ = "recipients"
    __table_args__ = (
        Index("ix_tc_recipient_patient", "tenant_id", "patient_id"),
        Index("ix_tc_recipient_status", "tenant_id", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    organ_needed: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # 1 = low, 5 = emergency
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="waitlisted")  # waitlisted, matched, transplanted, deceased
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class Waitlist(BaseModel):
    """Ranking of recipients for specific organs."""
    __tablename__ = "waitlists"
    __table_args__ = (
        Index("ix_tc_waitlist_recipient", "tenant_id", "recipient_id"),
        Index("ix_tc_waitlist_status", "tenant_id", "status"),
    )

    recipient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, suspended, removed


class Match(BaseModel):
    """Potential or confirmed pairings between donors and recipients."""
    __tablename__ = "matches"
    __table_args__ = (
        Index("ix_tc_match_donor", "tenant_id", "donor_id"),
        Index("ix_tc_match_recipient", "tenant_id", "recipient_id"),
    )

    donor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    recipient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    match_score: Mapped[float] = mapped_column(Float, nullable=False)  # e.g., HLA typing compatibility percentage
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="proposed")  # proposed, accepted, rejected, completed


class TransplantEvent(BaseModel):
    """Audit and operational events tracking the transplant lifecycle."""
    __tablename__ = "transplant_events"

    event_type: Mapped[str] = mapped_column(String(100), nullable=False)  # donor_registered, match_found, transplant_scheduled
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
