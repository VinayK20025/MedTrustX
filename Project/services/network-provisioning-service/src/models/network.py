"""
MedTrustX Network Provisioning Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Network(BaseModel):
    """A logical network space allocated to a tenant."""
    __tablename__ = "networks"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    cidr: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

class Subnet(BaseModel):
    """Sub-divided segments within a network."""
    __tablename__ = "subnets"
    __table_args__ = (
        Index("ix_subnet_network", "network_id"),
    )
    network_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    cidr: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

class IPAllocation(BaseModel):
    """Specific IP addresses mapped to internal services or devices."""
    __tablename__ = "ip_allocations"
    __table_args__ = (
        Index("ix_ip_subnet", "subnet_id"),
        Index("ix_ip_address", "ip_address"),
    )
    subnet_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(50), nullable=False)
    assigned_to: Mapped[str] = mapped_column(String(255), nullable=False) # service or device identifier
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="allocated")

class NetworkDevice(BaseModel):
    """Network appliances (switches, routers) configured by this service."""
    __tablename__ = "network_devices"
    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="provisioned")
