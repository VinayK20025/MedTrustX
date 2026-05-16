"""
MedTrustX Orders Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel

class Order(BaseModel):
    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_tenant_patient", "tenant_id", "patient_id"),
        Index("ix_orders_status", "id", "status"),
        Index("ix_orders_type", "order_type"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    order_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default=text("'pending'"))
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    routes: Mapped[List["OrderRoute"]] = relationship("OrderRoute", back_populates="order", cascade="all, delete-orphan")
    events: Mapped[List["OrderEvent"]] = relationship("OrderEvent", back_populates="order", cascade="all, delete-orphan", order_by="OrderEvent.created_at.desc()")
    # We define back_populates to None or skip it here to keep simple, since it's a self-ref link via order_dependencies.

class OrderItem(BaseModel):
    __tablename__ = "order_items"
    
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    item_type: Mapped[str] = mapped_column(String(50), nullable=False)
    reference_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default=text("'pending'"))

    order: Mapped["Order"] = relationship("Order", back_populates="items")

class OrderRoute(BaseModel):
    __tablename__ = "order_routes"

    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    target_service: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="routed", server_default=text("'routed'"))
    routed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"))

    order: Mapped["Order"] = relationship("Order", back_populates="routes")

class OrderDependency(BaseModel):
    __tablename__ = "order_dependencies"

    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    depends_on_order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)

    # These help with querying, not strictly required but useful
    order: Mapped["Order"] = relationship("Order", foreign_keys=[order_id])
    depends_on: Mapped["Order"] = relationship("Order", foreign_keys=[depends_on_order_id])

class OrderEvent(BaseModel):
    __tablename__ = "order_events"

    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="events")
