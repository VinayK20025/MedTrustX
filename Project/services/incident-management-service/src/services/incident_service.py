"""
MedTrustX Incident Management Service — Business Logic Layer

Incidents, assignments, updates, playbooks, and RCA.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.incident import (
    Incident,
    IncidentAssignment,
    IncidentUpdate,
    Playbook,
    RootCauseAnalysis,
)
from src.schemas.incident import (
    IncidentAssignmentCreate,
    IncidentCreate,
    IncidentUpdateCreate,
    PlaybookCreate,
    RootCauseAnalysisCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Incidents ──

async def create_incident(
    session: AsyncSession, tenant_id: uuid.UUID, data: IncidentCreate
) -> Incident:
    incident = Incident(
        tenant_id=tenant_id,
        incident_type=data.incident_type,
        severity=data.severity,
        source=data.source,
    )
    session.add(incident)
    await session.flush()
    await publish_event("INCIDENT_CREATED", tenant_id, incident.id, {"type": data.incident_type, "severity": data.severity})
    return incident


async def get_incident(
    session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID
) -> Optional[Incident]:
    result = await session.execute(
        select(Incident).where(and_(Incident.id == incident_id, Incident.tenant_id == tenant_id, Incident.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Incident Assignments ──

async def assign_incident(
    session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID, data: IncidentAssignmentCreate
) -> IncidentAssignment:
    assignment = IncidentAssignment(
        tenant_id=tenant_id,
        incident_id=incident_id,
        assigned_to=data.assigned_to,
    )
    session.add(assignment)
    await session.flush()
    await publish_event("INCIDENT_ASSIGNED", tenant_id, incident_id, {"assigned_to": str(data.assigned_to)})
    return assignment


# ── Incident Updates ──

async def update_incident(
    session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID, user_id: uuid.UUID, data: IncidentUpdateCreate
) -> IncidentUpdate:
    incident = await get_incident(session, tenant_id, incident_id)
    if incident:
        incident.status = data.status

    update = IncidentUpdate(
        tenant_id=tenant_id,
        incident_id=incident_id,
        status=data.status,
        notes=data.notes,
        updated_by=user_id,
    )
    session.add(update)
    await session.flush()

    if data.status == "resolved":
        await publish_event("INCIDENT_RESOLVED", tenant_id, incident_id, {})
    else:
        await publish_event("INCIDENT_UPDATED", tenant_id, incident_id, {"status": data.status})

    return update


# ── Playbooks ──

async def create_playbook(
    session: AsyncSession, tenant_id: uuid.UUID, data: PlaybookCreate
) -> Playbook:
    playbook = Playbook(
        tenant_id=tenant_id,
        name=data.name,
        steps=data.steps,
    )
    session.add(playbook)
    await session.flush()
    return playbook


async def get_playbooks(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[Playbook]:
    result = await session.execute(
        select(Playbook).where(and_(Playbook.tenant_id == tenant_id, Playbook.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Root Cause Analysis (RCA) ──

async def create_rca(
    session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID, data: RootCauseAnalysisCreate
) -> RootCauseAnalysis:
    rca = RootCauseAnalysis(
        tenant_id=tenant_id,
        incident_id=incident_id,
        findings=data.findings,
        actions=data.actions,
    )
    session.add(rca)
    await session.flush()
    await publish_event("RCA_COMPLETED", tenant_id, incident_id, {})
    return rca
