"""
MedTrustX Configuration Service — Domain Entities

Five tables orchestrating configurations, feature flags, environments,
versions, and audit logs.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Configuration(BaseModel):
    """Runtime configuration block for a specific service."""
    __tablename__ = "configurations"
    __table_args__ = (
        Index("ix_cs_config_svc", "tenant_id", "service_name"),
    )

    service_name: Mapped[str] = mapped_column(String(100), nullable=False)
    config_key: Mapped[str] = mapped_column(String(100), nullable=False)
    config_value: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class FeatureFlag(BaseModel):
    """Feature toggle for progressive delivery and instant kill switches."""
    __tablename__ = "feature_flags"
    __table_args__ = (
        Index("ix_cs_flag_name", "tenant_id", "flag_name"),
    )

    flag_name: Mapped[str] = mapped_column(String(100), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class Environment(BaseModel):
    """Environment definitions (dev, staging, production)."""
    __tablename__ = "environments"
    __table_args__ = (
        Index("ix_cs_env_name", "name"),
    )

    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")


class ConfigVersion(BaseModel):
    """Snapshot of a configuration change for rollback purposes."""
    __tablename__ = "config_versions"
    __table_args__ = (
        Index("ix_cs_ver_tenant", "tenant_id", "version"),
    )

    version: Mapped[int] = mapped_column(Integer, nullable=False)
    changes: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class ConfigAuditLog(BaseModel):
    """Audit trail of who changed what configuration."""
    __tablename__ = "config_audit_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # updated_flag, created_config
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
