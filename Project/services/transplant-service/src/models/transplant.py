"""
MedTrustX Transplant Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class Donor(BaseModel):
    __tablename__ = "donors"
    __table_args__ = (
        Index("ix_donors_tenant_organ", "tenant_id", "organ_type"),
    )

    donor_type: Mapped[str] = mapped_column(String(20), nullable=False)
    blood_group: Mapped[str] = mapped_column(String(5), nullable=False)
    organ_type: Mapped[str] = mapped_column(String(50), nullable=False)
    eligibility_status: Mapped[str] = mapped_column(String(20), nullable=False)
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class Recipient(BaseModel):
    __tablename__ = "recipients"
    __table_args__ = (
        Index("ix_recipients_tenant_organ", "tenant_id", "organ_needed"),
        Index("ix_recipients_id_status", "id", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    organ_needed: Mapped[str] = mapped_column(String(50), nullable=False)
    blood_group: Mapped[str] = mapped_column(String(5), nullable=False)
    urgency_level: Mapped[str] = mapped_column(String(20), nullable=False)
    listed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", server_default=text("'active'"))


class Waitlist(BaseModel):
    __tablename__ = "waitlists"
    __table_args__ = (
        Index("ix_waitlists_tenant_organ", "tenant_id", "organ_type"),
        Index("ix_waitlists_priority", "priority_score"),
    )

    organ_type: Mapped[str] = mapped_column(String(50), nullable=False)
    recipient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    priority_score: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", server_default=text("'active'"))
    # updated_at is handled by BaseModel


class Match(BaseModel):
    __tablename__ = "matches"
    __table_args__ = (
        Index("ix_matches_tenant_status", "tenant_id", "status"),
    )

    donor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    recipient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    compatibility_score: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="proposed", server_default=text("'proposed'"))
    matched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class Transplant(BaseModel):
    __tablename__ = "transplants"
    __table_args__ = (
        Index("ix_transplants_tenant_status", "tenant_id", "status"),
    )

    donor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    recipient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    surgery_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="scheduled", server_default=text("'scheduled'"))
    performed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
