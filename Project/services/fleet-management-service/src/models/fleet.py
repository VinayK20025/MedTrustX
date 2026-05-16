"""
MedTrustX Fleet Management Service — Domain Entities

Five tables orchestrating vehicles, drivers, trips, assignments, and tracking.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, Text, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Vehicle(BaseModel):
    """A registered hospital or partner vehicle (ambulance, van, etc.)."""
    __tablename__ = "vehicles"
    __table_args__ = (
        Index("ix_fm_veh_status", "tenant_id", "status"),
        Index("ix_fm_veh_reg", "tenant_id", "registration_number"),
    )

    vehicle_type: Mapped[str] = mapped_column(String(50), nullable=False)  # ambulance, van, mobile_clinic
    registration_number: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="available")  # available, active, maintenance


class Driver(BaseModel):
    """An authorized driver operating within the fleet."""
    __tablename__ = "drivers"
    __table_args__ = (
        Index("ix_fm_drv_user", "tenant_id", "user_id"),
        Index("ix_fm_drv_status", "tenant_id", "status"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    license_number: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="available")  # available, active, off_duty


class Trip(BaseModel):
    """A dispatched journey from point A to point B."""
    __tablename__ = "trips"
    __table_args__ = (
        Index("ix_fm_trip_veh", "tenant_id", "vehicle_id"),
        Index("ix_fm_trip_status", "tenant_id", "status"),
    )

    vehicle_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    trip_type: Mapped[str] = mapped_column(String(50), nullable=False)  # emergency, transfer, logistics
    start_location: Mapped[str] = mapped_column(Text, nullable=False)
    end_location: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="dispatched")  # dispatched, en_route, completed
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Assignment(BaseModel):
    """Mapping of a driver/crew member to a specific trip."""
    __tablename__ = "assignments"
    __table_args__ = (
        Index("ix_fm_assgn_trip", "tenant_id", "trip_id"),
        Index("ix_fm_assgn_drv", "tenant_id", "driver_id"),
    )

    trip_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    driver_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class VehicleTracking(BaseModel):
    """Real-time geographic telematics and tracking data."""
    __tablename__ = "vehicle_tracking"
    __table_args__ = (
        Index("ix_fm_trk_veh", "tenant_id", "vehicle_id"),
    )

    vehicle_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
