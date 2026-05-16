"""
MedTrustX Population Health Service — Business Logic Layer

Population cohort management, risk stratification, care gap detection,
and intervention tracking.  Risk scoring uses lightweight numpy heuristics
as a shim for production ML models from the AI Platform.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

import numpy as np
from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.population import (
    CareGap,
    Intervention,
    Population,
    PopulationMember,
    RiskProfile,
)
from src.schemas.population import InterventionCreateRequest, PopulationCreateRequest
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Populations ──

async def create_population(
    session: AsyncSession, tenant_id: uuid.UUID, data: PopulationCreateRequest
) -> Population:
    pop = Population(
        tenant_id=tenant_id,
        name=data.name,
        criteria=data.criteria,
    )
    session.add(pop)
    await session.flush()
    await publish_event("POPULATION_CREATED", tenant_id, pop.id, {"name": data.name})
    return pop


async def get_population(
    session: AsyncSession, tenant_id: uuid.UUID, pop_id: uuid.UUID
) -> Optional[Population]:
    result = await session.execute(
        select(Population).where(
            and_(Population.id == pop_id, Population.tenant_id == tenant_id, Population.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def list_populations(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[Population]:
    result = await session.execute(
        select(Population).where(and_(Population.tenant_id == tenant_id, Population.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Members ──

async def get_members(
    session: AsyncSession, tenant_id: uuid.UUID, pop_id: uuid.UUID
) -> List[PopulationMember]:
    result = await session.execute(
        select(PopulationMember).where(
            and_(
                PopulationMember.tenant_id == tenant_id,
                PopulationMember.population_id == pop_id,
                PopulationMember.deleted_at.is_(None),
            )
        )
        .order_by(desc(PopulationMember.risk_score))
    )
    return list(result.scalars().all())


async def add_member(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    pop_id: uuid.UUID,
    patient_id: uuid.UUID,
    risk_score: float = 0.0,
) -> PopulationMember:
    member = PopulationMember(
        tenant_id=tenant_id,
        population_id=pop_id,
        patient_id=patient_id,
        risk_score=risk_score,
    )
    session.add(member)
    await session.flush()
    return member


# ── Risk Profiles ──

async def get_risk_profiles(
    session: AsyncSession, tenant_id: uuid.UUID, patient_id: uuid.UUID
) -> List[RiskProfile]:
    result = await session.execute(
        select(RiskProfile).where(
            and_(
                RiskProfile.tenant_id == tenant_id,
                RiskProfile.patient_id == patient_id,
                RiskProfile.deleted_at.is_(None),
            )
        )
        .order_by(desc(RiskProfile.calculated_at))
    )
    return list(result.scalars().all())


async def compute_risk_profile(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    risk_type: str = "general",
    clinical_factors: Dict[str, Any] | None = None,
) -> RiskProfile:
    """Lightweight risk stratification using numpy heuristics."""
    factors = clinical_factors or {}
    age = factors.get("age", 50)
    comorbidities = factors.get("comorbidity_count", 0)
    bmi = factors.get("bmi", 25.0)

    score = float(np.clip(
        0.05 + (age / 200) + comorbidities * 0.07 + max(0, (bmi - 25) / 50) + np.random.normal(0, 0.03),
        0.0, 1.0,
    ))

    rp = RiskProfile(
        tenant_id=tenant_id,
        patient_id=patient_id,
        risk_type=risk_type,
        risk_score=round(score, 4),
        factors=factors,
    )
    session.add(rp)
    await session.flush()

    await publish_event(
        "RISK_SCORE_UPDATED", tenant_id, patient_id,
        {"risk_type": risk_type, "score": rp.risk_score},
    )
    return rp


# ── Care Gaps ──

async def get_care_gaps(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[CareGap]:
    result = await session.execute(
        select(CareGap)
        .where(and_(CareGap.tenant_id == tenant_id, CareGap.deleted_at.is_(None)))
        .order_by(desc(CareGap.identified_at))
        .limit(limit)
    )
    return list(result.scalars().all())


async def identify_care_gap(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    gap_type: str,
    details: Dict[str, Any] | None = None,
) -> CareGap:
    gap = CareGap(
        tenant_id=tenant_id,
        patient_id=patient_id,
        gap_type=gap_type,
        status="open",
        details=details or {},
    )
    session.add(gap)
    await session.flush()

    await publish_event(
        "CARE_GAP_IDENTIFIED", tenant_id, patient_id,
        {"gap_type": gap_type},
    )
    return gap


# ── Interventions ──

async def create_intervention(
    session: AsyncSession, tenant_id: uuid.UUID, data: InterventionCreateRequest
) -> Intervention:
    intv = Intervention(
        tenant_id=tenant_id,
        population_id=data.population_id,
        intervention_type=data.intervention_type,
        status="planned",
        config=data.config,
    )
    session.add(intv)
    await session.flush()

    await publish_event(
        "INTERVENTION_TRIGGERED", tenant_id, intv.id,
        {"type": data.intervention_type, "population_id": str(data.population_id)},
    )
    return intv


async def list_interventions(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[Intervention]:
    result = await session.execute(
        select(Intervention).where(and_(Intervention.tenant_id == tenant_id, Intervention.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
