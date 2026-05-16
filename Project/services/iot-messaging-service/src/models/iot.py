"""
MedTrustX IoT Messaging Service — Domain Entities

Five tables managing connections, topics, messages, commands, and events.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class DeviceConnection(BaseModel):
    """Tracks active and historical device connections to the broker."""
    __tablename__ = "device_connections"
    __table_args__ = (
        Index("ix_iot_conn_device", "tenant_id", "device_id"),
        Index("ix_iot_conn_status", "tenant_id", "status"),
    )

    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="connected")  # connected, disconnected
    connected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class MqttTopic(BaseModel):
    """Registered topics for routing and ACLs."""
    __tablename__ = "mqtt_topics"
    __table_args__ = (
        Index("ix_iot_topic_name", "tenant_id", "topic"),
    )

    topic: Mapped[str] = mapped_column(String(200), nullable=False)
    qos: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # 0, 1, 2


class MessageLog(BaseModel):
    """Telemetry and message ingestion logs."""
    __tablename__ = "message_logs"
    __table_args__ = (
        Index("ix_iot_msg_device", "tenant_id", "device_id"),
    )

    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    topic: Mapped[str] = mapped_column(String(200), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class DeviceCommand(BaseModel):
    """Instructions or configuration changes sent to a device."""
    __tablename__ = "device_commands"
    __table_args__ = (
        Index("ix_iot_cmd_device", "tenant_id", "device_id"),
    )

    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    command: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, delivered, failed
    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class DeviceEvent(BaseModel):
    """Lifecycle and operational events for devices."""
    __tablename__ = "device_events"
    __table_args__ = (
        Index("ix_iot_event_device", "tenant_id", "device_id"),
    )

    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)  # alert_triggered, status_change
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
