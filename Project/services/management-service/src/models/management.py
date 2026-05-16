"""
MedTrustX Management Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy import Boolean, DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class SystemConfig(BaseModel):
    __tablename__ = "system_configs"
    __table_args__ = (
        Index("ix_sysconf_tenant_key", "tenant_id", "config_key"),
    )

    config_key: Mapped[str] = mapped_column(String(100), nullable=False)
    config_value: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)


class FeatureFlag(BaseModel):
    __tablename__ = "feature_flags"
    __table_args__ = (
        Index("ix_feature_flags_name", "flag_name"),
    )

    flag_name: Mapped[str] = mapped_column(String(100), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text("false"))
    conditions: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)


class TenantSetting(BaseModel):
    __tablename__ = "tenant_settings"
    __table_args__ = (
        Index("ix_tenantset_tenant_key", "tenant_id", "setting_key"),
    )

    setting_key: Mapped[str] = mapped_column(String(100), nullable=False)
    setting_value: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)


class ServiceConfig(BaseModel):
    __tablename__ = "service_configs"
    __table_args__ = (
        Index("ix_service_configs_name", "service_name"),
        Index("ix_svcconf_tenant_service", "tenant_id", "service_name"),
    )

    service_name: Mapped[str] = mapped_column(String(100), nullable=False)
    config: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)


class ConfigAuditLog(BaseModel):
    __tablename__ = "config_audit_logs"

    config_key: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    performed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"))
