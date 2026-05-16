"""
MedTrustX Rostering Service — Domain Entities

Five tables orchestrating schedules, shifts, assignments, availability, and leaves.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Schedule(BaseModel):
    """A defined scheduling block (e.g., ICU Weekly Roster)."""
    __tablename__ = "schedules"
    __table_args__ = (
        Index("ix_rs_sched_dept", "tenant_id", "department"),
    )

    department: Mapped[str] = mapped_column(String(100), nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Shift(BaseModel):
    """A specific timeframe within a schedule needing coverage."""
    __tablename__ = "shifts"
    __table_args__ = (
        Index("ix_rs_shift_sched", "tenant_id", "schedule_id"),
    )

    schedule_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    shift_type: Mapped[str] = mapped_column(String(50), nullable=False)  # morning, evening, night, on_call
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Assignment(BaseModel):
    """Mapping of a user to a specific shift."""
    __tablename__ = "assignments"
    __table_args__ = (
        Index("ix_rs_assign_shift", "tenant_id", "shift_id"),
        Index("ix_rs_assign_user", "tenant_id", "user_id"),
    )

    shift_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class Availability(BaseModel):
    """Staff-declared availability or unavailability."""
    __tablename__ = "availability"
    __table_args__ = (
        Index("ix_rs_avail_user", "tenant_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    from_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    to_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Leave(BaseModel):
    """Approved/pending leave requests affecting scheduling."""
    __tablename__ = "leaves"
    __table_args__ = (
        Index("ix_rs_leave_user", "tenant_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    leave_type: Mapped[str] = mapped_column(String(50), nullable=False)  # pto, sick, maternity
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, approved, rejected
