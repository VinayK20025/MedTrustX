"""
MedTrustX Appointments Service — Domain Entities

Tables:
  schedules     – Base clinician availability rules (e.g., Dr. X is available Mon 9AM-5PM)
  slots         – Instantiated discrete time blocks generated from schedules
  appointments  – The actual booking mapping a patient to a slot
  queues        – Live operational waitlist tracking
"""
import uuid
from datetime import datetime, time
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Time,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class Schedule(BaseModel):
    """
    Recurring availability templates for a clinician.
    """

    __tablename__ = "schedules"
    __table_args__ = (
        Index("ix_schedules_doc_day", "tenant_id", "doctor_id", "day_of_week"),
        {"comment": "Doctor recurring availability"},
    )

    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    day_of_week: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="0=Monday, 6=Sunday",
    )

    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    end_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    slot_duration: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Duration in minutes (e.g., 15)",
    )

    # ── Relationships ───────────────────────────────────────────
    slots: Mapped[List["Slot"]] = relationship(
        "Slot", back_populates="schedule", cascade="all, delete-orphan"
    )


class Slot(BaseModel):
    """
    Discrete, bookable chunks of time generated from a Schedule.
    """

    __tablename__ = "slots"
    __table_args__ = (
        Index("ix_slots_schedule_status", "tenant_id", "schedule_id", "status"),
        Index("ix_slots_start", "tenant_id", "start_time"),
        {"comment": "Generated bookable time segments"},
    )

    schedule_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("schedules.id", ondelete="CASCADE"),
        nullable=False,
    )

    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="available",
        server_default=text("'available'"),
        comment="available | booked | blocked",
    )

    # ── Relationships ───────────────────────────────────────────
    schedule: Mapped["Schedule"] = relationship("Schedule", back_populates="slots")
    appointment: Mapped[Optional["Appointment"]] = relationship(
        "Appointment", back_populates="slot", uselist=False
    )


class Appointment(BaseModel):
    """
    The actual booking linking a patient, doctor, and slot.
    """

    __tablename__ = "appointments"
    __table_args__ = (
        Index("ix_appts_patient", "tenant_id", "patient_id"),
        Index("ix_appts_doctor", "tenant_id", "doctor_id"),
        Index("ix_appts_slot", "slot_id", unique=True),
        {"comment": "Patient bookings"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    slot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("slots.id"),
        nullable=False,
        unique=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="scheduled",
        server_default=text("'scheduled'"),
        comment="scheduled | checked_in | completed | cancelled | no_show",
    )

    reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    slot: Mapped["Slot"] = relationship("Slot", back_populates="appointment")
    queue: Mapped[Optional["Queue"]] = relationship(
        "Queue", back_populates="appointment", uselist=False
    )


class Queue(BaseModel):
    """
    Live operational tracking of checked-in patients waiting to be seen.
    """

    __tablename__ = "queues"
    __table_args__ = (
        Index("ix_queue_appt", "tenant_id", "appointment_id", unique=True),
        Index("ix_queue_status", "tenant_id", "status"),
        {"comment": "Live patient waitlist"},
    )

    appointment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    queue_position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="waiting",
        server_default=text("'waiting'"),
        comment="waiting | in_consultation | finished",
    )

    # ── Relationships ───────────────────────────────────────────
    appointment: Mapped["Appointment"] = relationship("Appointment", back_populates="queue")
