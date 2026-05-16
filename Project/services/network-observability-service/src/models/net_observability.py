"""
MedTrustX Network Observability Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import BigInteger, DateTime, Float, Index, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class NetworkFlow(BaseModel):
    """Raw flow records (NetFlow, sFlow, eBPF captures)."""
    __tablename__ = "network_flows"
    __table_args__ = (
        Index("ix_flow_tenant_src", "tenant_id", "source_ip"),
        Index("ix_flow_dest", "destination_ip"),
        Index("ix_flow_timestamp", "timestamp"),
    )
    source_ip: Mapped[str] = mapped_column(String(50), nullable=False)
    destination_ip: Mapped[str] = mapped_column(String(50), nullable=False)
    protocol: Mapped[str] = mapped_column(String(20), nullable=False)
    bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class TrafficMetric(BaseModel):
    """Aggregated network traffic statistics (latency, packet loss)."""
    __tablename__ = "traffic_metrics"
    __table_args__ = (
        Index("ix_tmetric_tenant_name", "tenant_id", "metric_name"),
    )
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class Dependency(BaseModel):
    """Inferred service-to-service communication edges based on flows."""
    __tablename__ = "dependencies"
    __table_args__ = (
        Index("ix_dep_tenant_src", "tenant_id", "source_service"),
    )
    source_service: Mapped[str] = mapped_column(String(100), nullable=False)
    destination_service: Mapped[str] = mapped_column(String(100), nullable=False)
    latency: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

class Anomaly(BaseModel):
    """Detected behavioral anomalies (traffic spikes, unexpected protocols)."""
    __tablename__ = "anomalies"
    __table_args__ = (
        Index("ix_anomaly_tenant_type", "tenant_id", "type"),
        Index("ix_anomaly_severity", "severity"),
    )
    type: Mapped[str] = mapped_column(String(100), nullable=False) # latency_spike, dos_suspected
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    details: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
