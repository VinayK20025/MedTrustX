"""
MedTrustX Network Management Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.network import DeviceMetric, FaultEvent, ManagedDevice, NetworkTopology
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def list_devices(session: AsyncSession, tenant_id: uuid.UUID) -> List[ManagedDevice]:
    result = await session.execute(
        select(ManagedDevice).where(
            and_(ManagedDevice.tenant_id == tenant_id, ManagedDevice.deleted_at.is_(None))
        ).limit(100)
    )
    return list(result.scalars().all())


async def get_device(session: AsyncSession, tenant_id: uuid.UUID, device_id: uuid.UUID) -> ManagedDevice | None:
    result = await session.execute(
        select(ManagedDevice).where(
            and_(ManagedDevice.id == device_id, ManagedDevice.tenant_id == tenant_id, ManagedDevice.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def list_metrics(session: AsyncSession, tenant_id: uuid.UUID) -> List[DeviceMetric]:
    result = await session.execute(
        select(DeviceMetric).where(
            and_(DeviceMetric.tenant_id == tenant_id, DeviceMetric.deleted_at.is_(None))
        ).order_by(DeviceMetric.timestamp.desc()).limit(100)
    )
    return list(result.scalars().all())


async def get_topology(session: AsyncSession, tenant_id: uuid.UUID) -> List[NetworkTopology]:
    result = await session.execute(
        select(NetworkTopology).where(
            and_(NetworkTopology.tenant_id == tenant_id, NetworkTopology.deleted_at.is_(None))
        )
    )
    return list(result.scalars().all())


async def list_faults(session: AsyncSession, tenant_id: uuid.UUID) -> List[FaultEvent]:
    result = await session.execute(
        select(FaultEvent).where(
            and_(FaultEvent.tenant_id == tenant_id, FaultEvent.deleted_at.is_(None))
        ).order_by(FaultEvent.created_at.desc()).limit(50)
    )
    return list(result.scalars().all())
