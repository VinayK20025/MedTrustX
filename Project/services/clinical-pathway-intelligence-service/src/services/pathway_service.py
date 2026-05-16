"""
MedTrustX Clinical Pathway Intelligence Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.pathway import ClinicalPathway, PathwayStep, PathwayVariance, PatientJourney
from src.schemas.pathway import JourneyCreate, PathwayCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Pathways ──

async def create_pathway(
    session: AsyncSession, tenant_id: uuid.UUID, data: PathwayCreate
) -> ClinicalPathway:
    pathway = ClinicalPathway(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description
    )
    session.add(pathway)
    await session.flush()
    return pathway


async def get_pathway(
    session: AsyncSession, tenant_id: uuid.UUID, pathway_id: uuid.UUID
) -> ClinicalPathway | None:
    result = await session.execute(
        select(ClinicalPathway).where(
            and_(ClinicalPathway.id == pathway_id, ClinicalPathway.tenant_id == tenant_id, ClinicalPathway.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Patient Journeys ──

async def create_journey(
    session: AsyncSession, tenant_id: uuid.UUID, data: JourneyCreate
) -> PatientJourney:
    journey = PatientJourney(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        pathway_id=data.pathway_id,
        current_step=1,
        status="active"
    )
    session.add(journey)
    await session.flush()

    await publish_event("PATHWAY_STARTED", tenant_id, journey.id, {
        "patient_id": str(data.patient_id), "pathway_id": str(data.pathway_id)
    })
    return journey


async def get_patient_journeys(
    session: AsyncSession, tenant_id: uuid.UUID, patient_id: uuid.UUID
) -> List[PatientJourney]:
    result = await session.execute(
        select(PatientJourney).where(
            and_(PatientJourney.tenant_id == tenant_id, PatientJourney.patient_id == patient_id, PatientJourney.deleted_at.is_(None))
        ).order_by(PatientJourney.created_at.desc())
    )
    return list(result.scalars().all())


# ── Variances ──

async def get_variances(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[PathwayVariance]:
    result = await session.execute(
        select(PathwayVariance).where(
            and_(PathwayVariance.tenant_id == tenant_id, PathwayVariance.deleted_at.is_(None))
        ).order_by(PathwayVariance.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
