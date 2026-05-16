"""
MedTrustX Fire & Safety Systems Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.safety import EmergencyAction, EvacuationLog, SafetyDevice, SafetyEvent
from src.schemas.safety import ActionCreate, DeviceCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Devices ──

async def create_device(session: AsyncSession, tenant_id: uuid.UUID, data: DeviceCreate) -> SafetyDevice:
    dev = SafetyDevice(tenant_id=tenant_id, device_type=data.device_type, location=data.location)
    session.add(dev)
    await session.flush()
    return dev

async def get_device(session: AsyncSession, tenant_id: uuid.UUID, device_id: uuid.UUID) -> SafetyDevice | None:
    result = await session.execute(
        select(SafetyDevice).where(and_(SafetyDevice.id == device_id, SafetyDevice.tenant_id == tenant_id, SafetyDevice.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Events & Actions ──

async def list_events(session: AsyncSession, tenant_id: uuid.UUID) -> List[SafetyEvent]:
    result = await session.execute(
        select(SafetyEvent).where(
            and_(SafetyEvent.tenant_id == tenant_id, SafetyEvent.deleted_at.is_(None))
        ).order_by(SafetyEvent.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())


async def trigger_action(session: AsyncSession, tenant_id: uuid.UUID, data: ActionCreate) -> EmergencyAction:
    act = EmergencyAction(tenant_id=tenant_id, action_type=data.action_type)
    session.add(act)
    
    # If it's an evacuation, log it
    if data.action_type == "evacuation" and data.target_zone:
        evac = EvacuationLog(tenant_id=tenant_id, zone=data.target_zone)
        session.add(evac)
        await publish_event("EVACUATION_STARTED", tenant_id, evac.id, {"zone": data.target_zone})
    
    await session.flush()
    
    event_name = f"{data.action_type.upper()}_ACTIVATED"
    await publish_event(event_name, tenant_id, act.id)
    return act


async def list_evacuations(session: AsyncSession, tenant_id: uuid.UUID) -> List[EvacuationLog]:
    result = await session.execute(
        select(EvacuationLog).where(
            and_(EvacuationLog.tenant_id == tenant_id, EvacuationLog.deleted_at.is_(None))
        ).order_by(EvacuationLog.started_at.desc()).limit(50)
    )
    return list(result.scalars().all())
