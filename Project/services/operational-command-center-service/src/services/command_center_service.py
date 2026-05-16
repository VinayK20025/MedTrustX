"""
MedTrustX Operational Command Center Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.command_center import Command, ControlSession, Incident, OperationalEvent
from src.schemas.command_center import CommandCreate, IncidentCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Incidents ──

async def create_incident(
    session: AsyncSession, tenant_id: uuid.UUID, data: IncidentCreate
) -> Incident:
    incident = Incident(
        tenant_id=tenant_id,
        type=data.type,
        severity=data.severity,
        status="open"
    )
    session.add(incident)
    await session.flush()

    await publish_event("INCIDENT_CREATED", tenant_id, incident.id, {
        "type": data.type, "severity": data.severity
    })
    return incident


async def get_incident(
    session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID
) -> Incident | None:
    result = await session.execute(
        select(Incident).where(
            and_(Incident.id == incident_id, Incident.tenant_id == tenant_id, Incident.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Commands ──

async def execute_command(
    session: AsyncSession, tenant_id: uuid.UUID, data: CommandCreate
) -> Command:
    cmd = Command(
        tenant_id=tenant_id,
        target_system=data.target_system,
        action=data.action,
        payload=data.payload,
        status="completed"  # Simulated immediate execution
    )
    session.add(cmd)
    await session.flush()

    await publish_event("COMMAND_EXECUTED", tenant_id, cmd.id, {
        "target": data.target_system, "action": data.action
    })
    return cmd


# ── Operational Events ──

async def get_events(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[OperationalEvent]:
    result = await session.execute(
        select(OperationalEvent).where(
            and_(OperationalEvent.tenant_id == tenant_id, OperationalEvent.deleted_at.is_(None))
        ).order_by(OperationalEvent.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())


# ── Control Sessions ──

async def get_sessions(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[ControlSession]:
    result = await session.execute(
        select(ControlSession).where(
            and_(ControlSession.tenant_id == tenant_id, ControlSession.deleted_at.is_(None))
        ).order_by(ControlSession.started_at.desc()).limit(50)
    )
    return list(result.scalars().all())
