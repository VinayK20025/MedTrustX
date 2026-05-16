"""
MedTrustX Wazuh Shim Service — Domain Entities
"""
import uuid

from sqlalchemy import Index, String, Integer, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class WazuhAlert(BaseModel):
    __tablename__ = "wazuh_alerts"
    __table_args__ = (
        Index("ix_wazuh_alert_severity", "tenant_id", "severity"),
    )

    rule_id: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False) # e.g., low, medium, high, critical
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    event_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))

class WazuhLog(BaseModel):
    __tablename__ = "wazuh_logs"
    __table_args__ = (
        Index("ix_wazuh_log_service", "tenant_id", "service_name"),
    )

    service_name: Mapped[str] = mapped_column(String(100), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    log_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))

class WazuhRule(BaseModel):
    __tablename__ = "wazuh_rules"

    rule_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    match_conditions: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
