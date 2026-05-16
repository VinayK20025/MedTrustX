"""
MedTrustX Vendor Management Service — Domain Entities

Five tables orchestrating vendors, contracts, SLAs, performance metrics, and risks.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Vendor(BaseModel):
    """An external party providing goods or services."""
    __tablename__ = "vendors"
    __table_args__ = (
        Index("ix_vm_vendor_type", "tenant_id", "vendor_type"),
        Index("ix_vm_vendor_status", "tenant_id", "status"),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    vendor_type: Mapped[str] = mapped_column(String(100), nullable=False)  # equipment, lab, pharmacy, housekeeping, fleet
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, inactive, under_review
    onboarded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class VendorContract(BaseModel):
    """Contract details and valid periods for a vendor."""
    __tablename__ = "vendor_contracts"
    __table_args__ = (
        Index("ix_vm_contract_vendor", "tenant_id", "vendor_id"),
    )

    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    contract_details: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class SLA(BaseModel):
    """Service Level Agreement targets agreed upon in the contract."""
    __tablename__ = "slas"
    __table_args__ = (
        Index("ix_vm_sla_vendor", "tenant_id", "vendor_id"),
    )

    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    metric: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., delivery_time, uptime
    target_value: Mapped[float] = mapped_column(Float, nullable=False)


class VendorPerformance(BaseModel):
    """Actual recorded performance metrics mapped against SLAs."""
    __tablename__ = "vendor_performance"
    __table_args__ = (
        Index("ix_vm_perf_vendor", "tenant_id", "vendor_id"),
        Index("ix_vm_perf_kpi", "tenant_id", "kpi"),
    )

    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    kpi: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class VendorRisk(BaseModel):
    """Risk profiles and assessments associated with third-party dependencies."""
    __tablename__ = "vendor_risks"
    __table_args__ = (
        Index("ix_vm_risk_vendor", "tenant_id", "vendor_id"),
    )

    vendor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    risk_type: Mapped[str] = mapped_column(String(100), nullable=False)  # financial, compliance, operational
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
