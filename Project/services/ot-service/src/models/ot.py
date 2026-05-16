"""
MedTrustX OT Management Service — Domain Entities

Tables:
  surgeries        – Core lifecycle of a surgical procedure
  ot_rooms         – Physical operating theatre rooms
  ot_bookings      – Temporal locking of a room for a surgery
  surgical_teams   – Assignments of staff (surgeon, nurse, anesthetist)
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class Surgery(BaseModel):
    """
    Orchestration root for a surgical procedure.
    """

    __tablename__ = "surgeries"
    __table_args__ = (
        Index("ix_surgeries_tenant_status", "tenant_id", "status"),
        Index("ix_surgeries_patient", "tenant_id", "patient_id"),
        {"comment": "Surgical procedure orchestration"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )

    procedure_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="scheduled",
        server_default=text("'scheduled'"),
        comment="scheduled | in_progress | completed | cancelled",
    )

    scheduled_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    
    scheduled_end: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    actual_start: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    actual_end: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    bookings: Mapped[List["OTBooking"]] = relationship(
        "OTBooking", back_populates="surgery"
    )
    team_members: Mapped[List["SurgicalTeam"]] = relationship(
        "SurgicalTeam", back_populates="surgery"
    )


class OTRoom(BaseModel):
    """
    Physical operating theatre.
    """

    __tablename__ = "ot_rooms"
    __table_args__ = (
        Index("ix_ot_rooms_status", "tenant_id", "status"),
        {"comment": "Operating Theatre physical rooms"},
    )

    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="available",
        server_default=text("'available'"),
        comment="available | occupied | maintenance",
    )

    # ── Relationships ───────────────────────────────────────────
    bookings: Mapped[List["OTBooking"]] = relationship(
        "OTBooking", back_populates="room"
    )


class OTBooking(BaseModel):
    """
    Time-bound reservation of an OT Room for a Surgery.
    """

    __tablename__ = "ot_bookings"
    __table_args__ = (
        Index("ix_ot_booking_conflict", "tenant_id", "ot_room_id", "booking_start"),
        {"comment": "Temporal room allocation"},
    )

    surgery_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("surgeries.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    ot_room_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ot_rooms.id", ondelete="RESTRICT"),
        nullable=False,
    )
    
    booking_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    
    booking_end: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    # ── Relationships ───────────────────────────────────────────
    surgery: Mapped["Surgery"] = relationship(
        "Surgery", back_populates="bookings"
    )
    room: Mapped["OTRoom"] = relationship(
        "OTRoom", back_populates="bookings"
    )


class SurgicalTeam(BaseModel):
    """
    Staff members assigned to a specific surgery.
    """

    __tablename__ = "surgical_teams"
    __table_args__ = (
        Index("ix_surgical_team_surgery", "tenant_id", "surgery_id"),
        {"comment": "Staff allocation to surgery"},
    )

    surgery_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("surgeries.id", ondelete="CASCADE"),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="surgeon | anesthetist | nurse",
    )
    
    staff_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Reference to IAM/HR user ID",
    )

    # ── Relationships ───────────────────────────────────────────
    surgery: Mapped["Surgery"] = relationship(
        "Surgery", back_populates="team_members"
    )
