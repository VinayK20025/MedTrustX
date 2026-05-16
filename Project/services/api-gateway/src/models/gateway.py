"""
MedTrustX Internal API Gateway — Domain Entities

Tables:
  gateway_routes       – Configuration for reverse proxy pathing
  gateway_policies     – Global or service-specific OPA configurations
  gateway_rate_limits  – Throttling quotas
  gateway_logs         – Audit trail of internal service communications
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Index,
    Integer,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class GatewayRoute(BaseModel):
    """
    Dynamic routing configuration defining how paths map to backend microservices.
    E.g., path='/clinical' -> upstream_url='http://clinical-service:8000'
    """

    __tablename__ = "gateway_routes"
    __table_args__ = (
        Index("ix_g_routes_path_method", "tenant_id", "path", "method"),
        {"comment": "Dynamic service routing rules"},
    )

    service_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    path: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        comment="The incoming prefix or exact path matcher",
    )
    
    method: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="*",
        server_default=text("'*'"),
    )

    upstream_url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    
    active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text("true"),
    )


class GatewayPolicy(BaseModel):
    """
    OPA configuration payloads injected by the gateway before routing.
    """

    __tablename__ = "gateway_policies"
    __table_args__ = (
        {"comment": "Zero Trust Authorization policies"},
    )

    policy_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="opa_rego | authz | authc",
    )
    
    config: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        comment="Policy definition or rego logic references",
    )
    
    applied_to: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Service name or specific route ID this policy binds to",
    )


class GatewayRateLimit(BaseModel):
    """
    Throttling quotas to prevent noisy-neighbor and DDOS attacks on internal services.
    """

    __tablename__ = "gateway_rate_limits"
    __table_args__ = (
        Index("ix_g_limits_key", "tenant_id", "key", unique=True),
        {"comment": "Traffic throttling rules"},
    )

    key: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Identifier for the limit (e.g., 'service:icu:read')",
    )

    limit_per_min: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    
    burst: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=10,
    )


class GatewayLog(BaseModel):
    """
    Immutable audit trail for east-west platform traffic.
    """

    __tablename__ = "gateway_logs"
    __table_args__ = (
        Index("ix_g_logs_req_id", "request_id"),
        Index("ix_g_logs_timestamp", "timestamp"),
        {"comment": "Audit trail for internal traffic routing"},
    )

    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    path: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    
    method: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )
    
    status_code: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    
    latency_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
