"""
MedTrustX Edge Connectivity Manager Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import BigInteger, DateTime, Float, Index, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class EdgeNode(BaseModel):
    """Remote facilities or isolated network enclaves."""
    __tablename__ = "edge_nodes"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="offline")

class ConnectivitySession(BaseModel):
    """Active VPN or secure tunnel connections between Edge and Core."""
    __tablename__ = "connectivity_sessions"
    __table_args__ = (
        Index("ix_session_tenant_node", "tenant_id", "node_id"),
        Index("ix_session_status", "status"),
    )
    node_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    tunnel_type: Mapped[str] = mapped_column(String(50), nullable=False) # wireguard, ipsec
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class LinkMetric(BaseModel):
    """Health metrics for the Edge-to-Core link."""
    __tablename__ = "link_metrics"
    __table_args__ = (
        Index("ix_lmetric_tenant_node", "tenant_id", "node_id"),
        Index("ix_lmetric_timestamp", "timestamp"),
    )
    node_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    latency: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    bandwidth: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    packet_loss: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class SyncLog(BaseModel):
    """Records of offline-buffering data synchronization batches."""
    __tablename__ = "sync_logs"
    __table_args__ = (
        Index("ix_sync_tenant_node", "tenant_id", "node_id"),
    )
    node_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    sync_status: Mapped[str] = mapped_column(String(50), nullable=False) # in_progress, completed, failed
    data_volume: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
