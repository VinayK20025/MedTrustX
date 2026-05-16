"""
MedTrustX Infection Control Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.infection import (
    AntimicrobialResistance,
    Infection,
    InfectionAudit,
    InfectionEvent,
    IsolationCase,
)
from src.schemas.infection import (
    AMRCreate,
    InfectionAuditCreate,
    InfectionCreate,
    InfectionEventCreate,
    InfectionUpdate,
    IsolationCaseCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Infections ──────────────────────────────────────────────────
async def record_infection(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: InfectionCreate,
) -> Infection:
    infection = Infection(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        infection_type=data.infection_type,
    )
    session.add(infection)
    await session.flush()

    await publish_event(
        "INFECTION_DETECTED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"infection_id": str(infection.id), "type": data.infection_type},
    )
    
    # Simple heuristic to trigger an outbreak check (In a real system this would be more complex)
    await _check_outbreak_threshold(session, tenant_id, data.infection_type)

    return infection


async def get_infection(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    infection_id: uuid.UUID,
) -> Optional[Infection]:
    result = await session.execute(
        select(Infection)
        .where(
            and_(
                Infection.id == infection_id,
                Infection.tenant_id == tenant_id,
                Infection.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_infection_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    infection_id: uuid.UUID,
    data: InfectionUpdate,
) -> Optional[Infection]:
    infection = await get_infection(session, tenant_id, infection_id)
    if not infection:
        return None

    if data.status != infection.status:
        infection.status = data.status
        if data.status == "resolved":
            infection.resolved_at = datetime.now(timezone.utc)
        
        infection.updated_at = datetime.now(timezone.utc)
        await session.flush()

        await publish_event(
            "INFECTION_STATUS_CHANGED",
            tenant_id=tenant_id,
            patient_id=infection.patient_id,
            payload={"infection_id": str(infection.id), "status": data.status},
        )

    return infection


async def _check_outbreak_threshold(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    infection_type: str,
) -> None:
    """Basic check to see if an outbreak should be flagged."""
    # Count active infections of this type in the last 7 days
    # (Mock implementation of threshold logic)
    # If threshold > X, publish OUTBREAK_IDENTIFIED event
    # Omitted for brevity in mock
    pass


# ── Events ──────────────────────────────────────────────────────
async def add_infection_event(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    infection_id: uuid.UUID,
    data: InfectionEventCreate,
) -> Optional[InfectionEvent]:
    infection = await get_infection(session, tenant_id, infection_id)
    if not infection:
        return None

    event = InfectionEvent(
        tenant_id=tenant_id,
        infection_id=infection_id,
        event_type=data.event_type,
        description=data.description,
    )
    session.add(event)
    await session.flush()
    return event


async def get_infection_events(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    infection_id: uuid.UUID,
) -> List[InfectionEvent]:
    result = await session.execute(
        select(InfectionEvent)
        .where(
            and_(
                InfectionEvent.infection_id == infection_id,
                InfectionEvent.tenant_id == tenant_id,
                InfectionEvent.deleted_at.is_(None),
            )
        )
        .order_by(desc(InfectionEvent.recorded_at))
    )
    return list(result.scalars().all())


# ── Isolation Cases ─────────────────────────────────────────────
async def start_isolation(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: IsolationCaseCreate,
) -> IsolationCase:
    isolation = IsolationCase(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        isolation_type=data.isolation_type,
    )
    session.add(isolation)
    await session.flush()

    await publish_event(
        "ISOLATION_STARTED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"isolation_id": str(isolation.id), "type": data.isolation_type},
    )
    return isolation


async def get_patient_isolation(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[IsolationCase]:
    result = await session.execute(
        select(IsolationCase)
        .where(
            and_(
                IsolationCase.patient_id == patient_id,
                IsolationCase.tenant_id == tenant_id,
                IsolationCase.deleted_at.is_(None),
            )
        )
        .order_by(desc(IsolationCase.start_time))
    )
    return list(result.scalars().all())


# ── Audits ──────────────────────────────────────────────────────
async def record_audit(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    data: InfectionAuditCreate,
) -> InfectionAudit:
    audit = InfectionAudit(
        tenant_id=tenant_id,
        audit_type=data.audit_type,
        department=data.department,
        score=data.score,
        conducted_by=user_id,
    )
    session.add(audit)
    await session.flush()

    await publish_event(
        "AUDIT_COMPLETED",
        tenant_id=tenant_id,
        payload={"department": data.department, "score": data.score},
    )
    return audit


async def get_audits(
    session: AsyncSession,
    tenant_id: uuid.UUID,
) -> List[InfectionAudit]:
    result = await session.execute(
        select(InfectionAudit)
        .where(
            and_(
                InfectionAudit.tenant_id == tenant_id,
                InfectionAudit.deleted_at.is_(None),
            )
        )
        .order_by(desc(InfectionAudit.conducted_at))
    )
    return list(result.scalars().all())


# ── Antimicrobial Resistance ────────────────────────────────────
async def record_resistance(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: AMRCreate,
) -> AntimicrobialResistance:
    amr = AntimicrobialResistance(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        organism=data.organism,
        drug=data.drug,
        resistance_level=data.resistance_level,
    )
    session.add(amr)
    await session.flush()

    await publish_event(
        "RESISTANCE_RECORDED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"organism": data.organism, "drug": data.drug, "level": data.resistance_level},
    )
    return amr


async def get_patient_resistance(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[AntimicrobialResistance]:
    result = await session.execute(
        select(AntimicrobialResistance)
        .where(
            and_(
                AntimicrobialResistance.patient_id == patient_id,
                AntimicrobialResistance.tenant_id == tenant_id,
                AntimicrobialResistance.deleted_at.is_(None),
            )
        )
        .order_by(desc(AntimicrobialResistance.recorded_at))
    )
    return list(result.scalars().all())
