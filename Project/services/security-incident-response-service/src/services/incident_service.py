"""
MedTrustX Security Incident Response Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.incident import Incident, IncidentAction, IncidentLog, Responder
from src.schemas.incident import ActionCreate, IncidentCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Incidents ──

async def create_incident(session: AsyncSession, tenant_id: uuid.UUID, data: IncidentCreate) -> Incident:
    inc = Incident(tenant_id=tenant_id, type=data.type, severity=data.severity, location=data.location)
    session.add(inc)
    
    log = IncidentLog(tenant_id=tenant_id, incident_id=inc.id, event_type="created", payload={"severity": data.severity})
    session.add(log)
    
    await session.flush()
    await publish_event("INCIDENT_CREATED", tenant_id, inc.id, {"severity": inc.severity, "type": inc.type})
    return inc


async def get_incident(session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID) -> Incident | None:
    result = await session.execute(
        select(Incident).where(and_(Incident.id == incident_id, Incident.tenant_id == tenant_id, Incident.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Actions & Workflows ──

async def add_action(session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID, data: ActionCreate) -> IncidentAction | None:
    inc = await get_incident(session, tenant_id, incident_id)
    if not inc:
        return None
    
    act = IncidentAction(tenant_id=tenant_id, incident_id=inc.id, action_type=data.action_type)
    session.add(act)
    
    log = IncidentLog(tenant_id=tenant_id, incident_id=inc.id, event_type="action_initiated", payload={"action": data.action_type})
    session.add(log)
    
    # Update incident state if necessary
    if inc.status == "open":
        inc.status = "investigating"
    
    await session.flush()
    await publish_event("RESPONSE_INITIATED", tenant_id, inc.id, {"action": act.action_type})
    return act


# ── Auditing & Queries ──

async def list_logs(session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID) -> List[IncidentLog]:
    result = await session.execute(
        select(IncidentLog).where(
            and_(IncidentLog.tenant_id == tenant_id, IncidentLog.incident_id == incident_id, IncidentLog.deleted_at.is_(None))
        ).order_by(IncidentLog.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())


async def list_responders(session: AsyncSession, tenant_id: uuid.UUID) -> List[Responder]:
    result = await session.execute(
        select(Responder).where(
            and_(Responder.tenant_id == tenant_id, Responder.deleted_at.is_(None))
        ).order_by(Responder.assigned_at.desc()).limit(50)
    )
    return list(result.scalars().all())
