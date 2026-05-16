"""
MedTrustX Inventory Service — Domain Entities

Tables:
  inventory_items    – Master catalog of all hospital items
  stock_levels       – Real-time aggregate count of available stock
  stock_batches      – Specific physical batches with expiry dates
  stock_movements    – Audit trail of inbound, outbound, and adjustments
  stock_reservations – Locked inventory for upcoming procedures
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class InventoryItem(BaseModel):
    """
    Master catalog entry for an item.
    """

    __tablename__ = "inventory_items"
    __table_args__ = (
        Index("ix_inv_items_name", "tenant_id", "name"),
        Index("ix_inv_items_category", "tenant_id", "category"),
        {"comment": "Master catalog of inventory items"},
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="drug | consumable | surgical | equipment | general",
    )

    unit: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="mg | ml | piece | box",
    )

    # ── Relationships ───────────────────────────────────────────
    levels: Mapped[Optional["StockLevel"]] = relationship(
        "StockLevel", back_populates="item", uselist=False
    )
    batches: Mapped[List["StockBatch"]] = relationship(
        "StockBatch", back_populates="item", cascade="all, delete-orphan"
    )
    movements: Mapped[List["StockMovement"]] = relationship(
        "StockMovement", back_populates="item", cascade="all, delete-orphan"
    )
    reservations: Mapped[List["StockReservation"]] = relationship(
        "StockReservation", back_populates="item", cascade="all, delete-orphan"
    )


class StockLevel(BaseModel):
    """
    Real-time aggregate count of available stock for an item.
    """

    __tablename__ = "stock_levels"
    __table_args__ = (
        Index("ix_stock_levels_item", "tenant_id", "item_id", unique=True),
        {"comment": "Real-time aggregated stock availability"},
    )

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("inventory_items.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    available_quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0"),
    )

    # ── Relationships ───────────────────────────────────────────
    item: Mapped["InventoryItem"] = relationship("InventoryItem", back_populates="levels")


class StockBatch(BaseModel):
    """
    Specific shipment batches, critical for expiry management of drugs.
    """

    __tablename__ = "stock_batches"
    __table_args__ = (
        Index("ix_stock_batches_item", "tenant_id", "item_id"),
        Index("ix_stock_batches_expiry", "tenant_id", "expiry_date"),
        {"comment": "Physical batch tracking and expiry"},
    )

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("inventory_items.id", ondelete="CASCADE"),
        nullable=False,
    )

    batch_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    expiry_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    item: Mapped["InventoryItem"] = relationship("InventoryItem", back_populates="batches")


class StockMovement(BaseModel):
    """
    Immutable audit ledger of stock flowing in and out.
    """

    __tablename__ = "stock_movements"
    __table_args__ = (
        Index("ix_stock_movements_item", "tenant_id", "item_id"),
        Index("ix_stock_movements_type", "tenant_id", "movement_type"),
        {"comment": "Audit trail of stock flow"},
    )

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("inventory_items.id", ondelete="CASCADE"),
        nullable=False,
    )

    movement_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="inbound | outbound | adjustment | write_off",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Positive for inbound, Negative for outbound",
    )

    reference_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="E.g., Procurement Order ID or Patient Encounter ID",
    )

    # ── Relationships ───────────────────────────────────────────
    item: Mapped["InventoryItem"] = relationship("InventoryItem", back_populates="movements")


class StockReservation(BaseModel):
    """
    Locks inventory for a specific upcoming need (e.g., reserving a surgical kit for tomorrow's OT).
    """

    __tablename__ = "stock_reservations"
    __table_args__ = (
        Index("ix_reservations_item", "tenant_id", "item_id"),
        Index("ix_reservations_status", "tenant_id", "status"),
        {"comment": "Hard allocations of stock for upcoming procedures"},
    )

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("inventory_items.id", ondelete="CASCADE"),
        nullable=False,
    )

    reserved_quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    reference_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="surgery | patient_admission | external_transfer",
    )

    reference_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | fulfilled | released",
    )

    # ── Relationships ───────────────────────────────────────────
    item: Mapped["InventoryItem"] = relationship("InventoryItem", back_populates="reservations")
