"""
MedTrustX SCM Service — Domain Entities

Tables:
  vendors               – Supplier organizations
  purchase_orders       – Formal requests for procurement
  purchase_order_items  – Line items on a PO
  goods_receipts        – Logs of physical stock arriving at loading dock
  shipments             – Logistics tracking for active POs
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class Vendor(BaseModel):
    """
    Suppliers of medical and non-medical goods.
    """

    __tablename__ = "vendors"
    __table_args__ = (
        Index("ix_vendors_name", "tenant_id", "name"),
        {"comment": "Supplier organizations"},
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    contact_info: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | suspended | blacklisted",
    )

    # ── Relationships ───────────────────────────────────────────
    purchase_orders: Mapped[List["PurchaseOrder"]] = relationship(
        "PurchaseOrder", back_populates="vendor", cascade="all, delete-orphan"
    )


class PurchaseOrder(BaseModel):
    """
    Formal procurement request sent to a vendor.
    """

    __tablename__ = "purchase_orders"
    __table_args__ = (
        Index("ix_po_vendor", "tenant_id", "vendor_id"),
        Index("ix_po_status", "tenant_id", "status"),
        {"comment": "Purchase Orders"},
    )

    vendor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("vendors.id", ondelete="CASCADE"),
        nullable=False,
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0.00,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="draft",
        server_default=text("'draft'"),
        comment="draft | pending_approval | approved | dispatched | fulfilled | cancelled",
    )

    approved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    vendor: Mapped["Vendor"] = relationship("Vendor", back_populates="purchase_orders")
    items: Mapped[List["PurchaseOrderItem"]] = relationship(
        "PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan"
    )
    goods_receipts: Mapped[List["GoodsReceipt"]] = relationship(
        "GoodsReceipt", back_populates="purchase_order", cascade="all, delete-orphan"
    )
    shipments: Mapped[List["Shipment"]] = relationship(
        "Shipment", back_populates="purchase_order", cascade="all, delete-orphan"
    )


class PurchaseOrderItem(BaseModel):
    """
    Line items explicitly associated with a Purchase Order.
    """

    __tablename__ = "purchase_order_items"
    __table_args__ = (
        Index("ix_po_items_po", "tenant_id", "purchase_order_id"),
        {"comment": "PO line items"},
    )

    purchase_order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("purchase_orders.id", ondelete="CASCADE"),
        nullable=False,
    )

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Link to inventory_items table in inventory-service",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    # ── Relationships ───────────────────────────────────────────
    purchase_order: Mapped["PurchaseOrder"] = relationship("PurchaseOrder", back_populates="items")


class GoodsReceipt(BaseModel):
    """
    Record of physical goods arriving at the loading dock against a PO.
    """

    __tablename__ = "goods_receipts"
    __table_args__ = (
        Index("ix_gr_po", "tenant_id", "purchase_order_id"),
        {"comment": "Physical receiving logs"},
    )

    purchase_order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("purchase_orders.id", ondelete="CASCADE"),
        nullable=False,
    )

    received_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="ID of the staff who signed for the goods",
    )

    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending_qa",
        server_default=text("'pending_qa'"),
        comment="pending_qa | accepted | rejected",
    )

    # ── Relationships ───────────────────────────────────────────
    purchase_order: Mapped["PurchaseOrder"] = relationship("PurchaseOrder", back_populates="goods_receipts")


class Shipment(BaseModel):
    """
    Logistics tracking for active POs en route to the hospital.
    """

    __tablename__ = "shipments"
    __table_args__ = (
        Index("ix_shipments_po", "tenant_id", "purchase_order_id"),
        {"comment": "In-transit tracking"},
    )

    purchase_order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("purchase_orders.id", ondelete="CASCADE"),
        nullable=False,
    )

    tracking_number: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="in_transit",
        server_default=text("'in_transit'"),
        comment="preparing | in_transit | delayed | delivered",
    )

    estimated_delivery: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    purchase_order: Mapped["PurchaseOrder"] = relationship("PurchaseOrder", back_populates="shipments")
