"""
MedTrustX IoT Messaging Service — Business Logic Layer

Connections, topics, messages, and commands.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.iot import (
    DeviceCommand,
    DeviceConnection,
    DeviceEvent,
    MessageLog,
    MqttTopic,
)
from src.schemas.iot import (
    DeviceCommandCreate,
    DeviceConnectionCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Connections ──

async def connect_device(
    session: AsyncSession, tenant_id: uuid.UUID, data: DeviceConnectionCreate
) -> DeviceConnection:
    # Mark old connections for this device as disconnected
    existing_result = await session.execute(
        select(DeviceConnection).where(and_(DeviceConnection.device_id == data.device_id, DeviceConnection.tenant_id == tenant_id, DeviceConnection.status == "connected"))
    )
    for conn in existing_result.scalars().all():
        conn.status = "disconnected"

    connection = DeviceConnection(
        tenant_id=tenant_id,
        device_id=data.device_id,
    )
    session.add(connection)
    await session.flush()
    await publish_event("DEVICE_CONNECTED", tenant_id, connection.id, {"device_id": str(data.device_id)})
    return connection


# ── Topics ──

async def get_topics(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[MqttTopic]:
    result = await session.execute(
        select(MqttTopic).where(and_(MqttTopic.tenant_id == tenant_id, MqttTopic.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Messages ──

async def get_device_messages(
    session: AsyncSession, tenant_id: uuid.UUID, device_id: uuid.UUID
) -> List[MessageLog]:
    result = await session.execute(
        select(MessageLog).where(and_(MessageLog.device_id == device_id, MessageLog.tenant_id == tenant_id, MessageLog.deleted_at.is_(None)))
        .order_by(MessageLog.received_at.desc())
        .limit(100)
    )
    return list(result.scalars().all())


# ── Commands ──

async def send_command(
    session: AsyncSession, tenant_id: uuid.UUID, device_id: uuid.UUID, data: DeviceCommandCreate
) -> DeviceCommand:
    command = DeviceCommand(
        tenant_id=tenant_id,
        device_id=device_id,
        command=data.command,
        status="sent",
    )
    session.add(command)
    await session.flush()
    await publish_event("COMMAND_SENT", tenant_id, command.id, {"device_id": str(device_id)})
    return command


# ── Events ──

async def get_device_events(
    session: AsyncSession, tenant_id: uuid.UUID, device_id: uuid.UUID
) -> List[DeviceEvent]:
    result = await session.execute(
        select(DeviceEvent).where(and_(DeviceEvent.device_id == device_id, DeviceEvent.tenant_id == tenant_id, DeviceEvent.deleted_at.is_(None)))
        .order_by(DeviceEvent.created_at.desc())
        .limit(100)
    )
    return list(result.scalars().all())
