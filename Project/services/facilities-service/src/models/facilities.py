"""
MedTrustX Facilities Service — Domain Entities

Tables:
  facilities            – Main buildings or hospital campuses
  rooms                 – Individual rooms within a facility
  assets                – Non-consumable physical assets (HVAC, Generators, MRI machines)
  maintenance_requests  – Reactive break-fix tickets
  maintenance_schedules – Proactive scheduled maintenance
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class Facility(BaseModel):
    """
    Main buildings, wings, or campuses.
    """

    __tablename__ = "facilities"
    __table_args__ = (
        Index("ix_facilities_name", "tenant_id", "name"),
        {"comment": "Main hospital facilities"},
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="main_hospital | clinic | laboratory | storage",
    )

    location: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | inactive | maintenance",
    )

    # ── Relationships ───────────────────────────────────────────
    rooms: Mapped[List["Room"]] = relationship("Room", back_populates="facility", cascade="all, delete-orphan")


class Room(BaseModel):
    """
    Individual rooms within a facility (Wards, OTs, ICUs).
    """

    __tablename__ = "rooms"
    __table_args__ = (
        Index("ix_rooms_facility", "tenant_id", "facility_id"),
        Index("ix_rooms_number", "tenant_id", "room_number"),
        {"comment": "Individual physical rooms"},
    )

    facility_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("facilities.id", ondelete="CASCADE"),
        nullable=False,
    )

    room_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="ward | icu | ot | consultation | lab | utility",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="available",
        server_default=text("'available'"),
        comment="available | occupied | maintenance | cleaning",
    )

    # ── Relationships ───────────────────────────────────────────
    facility: Mapped["Facility"] = relationship("Facility", back_populates="rooms")


class Asset(BaseModel):
    """
    Non-consumable physical assets (HVAC, Elevators, MRI, Generators).
    """

    __tablename__ = "assets"
    __table_args__ = (
        Index("ix_assets_name", "tenant_id", "name"),
        Index("ix_assets_status", "tenant_id", "status"),
        {"comment": "Physical infrastructure assets"},
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="medical_equipment | utility | hvac | IT | furniture",
    )

    location: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Facility/Room reference or generic location description",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="operational",
        server_default=text("'operational'"),
        comment="operational | degraded | offline | maintenance",
    )

    # ── Relationships ───────────────────────────────────────────
    maintenance_requests: Mapped[List["MaintenanceRequest"]] = relationship(
        "MaintenanceRequest", back_populates="asset", cascade="all, delete-orphan"
    )
    maintenance_schedules: Mapped[List["MaintenanceSchedule"]] = relationship(
        "MaintenanceSchedule", back_populates="asset", cascade="all, delete-orphan"
    )


class MaintenanceRequest(BaseModel):
    """
    Reactive break-fix tickets.
    """

    __tablename__ = "maintenance_requests"
    __table_args__ = (
        Index("ix_mreq_asset", "tenant_id", "asset_id"),
        Index("ix_mreq_status", "tenant_id", "status"),
        {"comment": "Reactive maintenance tickets"},
    )

    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="CASCADE"),
        nullable=False,
    )

    issue_description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="open",
        server_default=text("'open'"),
        comment="open | in_progress | resolved | cancelled",
    )

    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    asset: Mapped["Asset"] = relationship("Asset", back_populates="maintenance_requests")


class MaintenanceSchedule(BaseModel):
    """
    Proactive scheduled maintenance (e.g., Annual HVAC servicing).
    """

    __tablename__ = "maintenance_schedules"
    __table_args__ = (
        Index("ix_msch_asset", "tenant_id", "asset_id"),
        Index("ix_msch_due", "tenant_id", "next_due"),
        {"comment": "Proactive preventive maintenance"},
    )

    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="CASCADE"),
        nullable=False,
    )

    schedule_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="weekly | monthly | annual | usage_based",
    )

    next_due: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    # ── Relationships ───────────────────────────────────────────
    asset: Mapped["Asset"] = relationship("Asset", back_populates="maintenance_schedules")
