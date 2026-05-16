"""
MedTrustX Perimeter Security Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.perimeter import IntrusionEvent, PerimeterZone, ResponseAction, Sensor
from src.schemas.perimeter import ResponseCreate, SensorCreate, ZoneCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Zones & Sensors ──

async def create_zone(session: AsyncSession, tenant_id: uuid.UUID, data: ZoneCreate) -> PerimeterZone:
    zone = PerimeterZone(tenant_id=tenant_id, name=data.name, boundary=data.boundary)
    session.add(zone)
    await session.flush()
    return zone


async def get_zone(session: AsyncSession, tenant_id: uuid.UUID, zone_id: uuid.UUID) -> PerimeterZone | None:
    result = await session.execute(
        select(PerimeterZone).where(
            and_(PerimeterZone.id == zone_id, PerimeterZone.tenant_id == tenant_id, PerimeterZone.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def create_sensor(session: AsyncSession, tenant_id: uuid.UUID, data: SensorCreate) -> Sensor:
    sen = Sensor(tenant_id=tenant_id, zone_id=data.zone_id, sensor_type=data.sensor_type)
    session.add(sen)
    await session.flush()
    return sen


# ── Intrusion Events & Responses ──

async def list_events(session: AsyncSession, tenant_id: uuid.UUID) -> List[IntrusionEvent]:
    result = await session.execute(
        select(IntrusionEvent).where(
            and_(IntrusionEvent.tenant_id == tenant_id, IntrusionEvent.deleted_at.is_(None))
        ).order_by(IntrusionEvent.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())


async def trigger_response(session: AsyncSession, tenant_id: uuid.UUID, data: ResponseCreate) -> ResponseAction:
    act = ResponseAction(tenant_id=tenant_id, event_id=data.event_id, action_type=data.action_type)
    session.add(act)
    await session.flush()
    await publish_event("RESPONSE_INITIATED", tenant_id, act.id, {"action": data.action_type, "event_id": str(data.event_id)})
    return act
