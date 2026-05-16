"""
MedTrustX Multi-Tenant Isolation Manager Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Tenant(BaseModel):
    """Core tenant records indicating valid organization boundaries."""
    __tablename__ = "tenants"
    __table_args__ = (
        Index("ix_tenant_status", "status"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

class IsolationPolicy(BaseModel):
    """Rules defining what resources and actions are restricted within a tenant's boundary."""
    __tablename__ = "isolation_policies"
    policy_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class AccessLog(BaseModel):
    """Audit records of cross-tenant or boundary access attempts."""
    __tablename__ = "access_logs"
    __table_args__ = (
        Index("ix_access_tenant_resource", "tenant_id", "resource_id"),
        Index("ix_access_created_at", "created_at"),
    )
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False) # granted, denied

class ContextPropagation(BaseModel):
    """Tracking of tenant context flow across distributed boundaries."""
    __tablename__ = "context_propagation"
    __table_args__ = (
        Index("ix_context_tenant_service", "tenant_id", "service_name"),
    )
    request_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    propagated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
