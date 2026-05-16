"""
MedTrustX Treatment Plan Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.treatment import (
    TreatmentAdherence,
    TreatmentPlan,
    TreatmentPlanItem,
    TreatmentPlanVersion,
)
from src.schemas.treatment import (
    TreatmentAdherenceCreate,
    TreatmentPlanCreate,
    TreatmentPlanItemCreate,
    TreatmentPlanUpdate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Plans ───────────────────────────────────────────────────────
async def create_plan(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    data: TreatmentPlanCreate,
) -> TreatmentPlan:
    plan = TreatmentPlan(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        plan_name=data.plan_name,
        created_by=user_id,
    )
    session.add(plan)
    
    for item_data in data.items:
        item = TreatmentPlanItem(
            tenant_id=tenant_id,
            treatment_plan_id=plan.id,
            item_type=item_data.item_type,
            description=item_data.description,
            schedule=item_data.schedule,
        )
        session.add(item)
        plan.items.append(item)

    await session.flush()

    # Create Initial Version Record
    initial_snapshot = {"plan_name": data.plan_name, "items": [i.model_dump() for i in data.items]}
    version_record = TreatmentPlanVersion(
        tenant_id=tenant_id,
        treatment_plan_id=plan.id,
        version=1,
        changes=initial_snapshot,
    )
    session.add(version_record)
    await session.flush()

    await publish_event(
        "TREATMENT_PLAN_CREATED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"treatment_plan_id": str(plan.id), "plan_name": data.plan_name},
    )
    return plan


async def get_plan(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    plan_id: uuid.UUID,
) -> Optional[TreatmentPlan]:
    result = await session.execute(
        select(TreatmentPlan)
        .options(selectinload(TreatmentPlan.items))
        .where(
            and_(
                TreatmentPlan.id == plan_id,
                TreatmentPlan.tenant_id == tenant_id,
                TreatmentPlan.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def get_patient_plans(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[TreatmentPlan]:
    result = await session.execute(
        select(TreatmentPlan)
        .options(selectinload(TreatmentPlan.items))
        .where(
            and_(
                TreatmentPlan.patient_id == patient_id,
                TreatmentPlan.tenant_id == tenant_id,
                TreatmentPlan.deleted_at.is_(None),
            )
        )
        .order_by(desc(TreatmentPlan.created_at))
    )
    return list(result.scalars().all())


async def update_plan(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    plan_id: uuid.UUID,
    data: TreatmentPlanUpdate,
) -> Optional[TreatmentPlan]:
    plan = await get_plan(session, tenant_id, plan_id)
    if not plan:
        return None

    if data.status and data.status != plan.status:
        plan.status = data.status
        plan.version += 1
        plan.updated_at = datetime.now(timezone.utc)
        
        # Log version change
        version_record = TreatmentPlanVersion(
            tenant_id=tenant_id,
            treatment_plan_id=plan.id,
            version=plan.version,
            changes={"status_changed_to": data.status},
        )
        session.add(version_record)
        await session.flush()

        await publish_event(
            "TREATMENT_PLAN_UPDATED",
            tenant_id=tenant_id,
            patient_id=plan.patient_id,
            payload={"treatment_plan_id": str(plan.id), "status": data.status, "version": plan.version},
        )

    return plan


# ── Items ───────────────────────────────────────────────────────
async def add_plan_item(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    plan_id: uuid.UUID,
    data: TreatmentPlanItemCreate,
) -> Optional[TreatmentPlanItem]:
    plan = await get_plan(session, tenant_id, plan_id)
    if not plan:
        return None

    item = TreatmentPlanItem(
        tenant_id=tenant_id,
        treatment_plan_id=plan_id,
        item_type=data.item_type,
        description=data.description,
        schedule=data.schedule,
    )
    session.add(item)
    
    # Bump plan version
    plan.version += 1
    plan.updated_at = datetime.now(timezone.utc)
    
    version_record = TreatmentPlanVersion(
        tenant_id=tenant_id,
        treatment_plan_id=plan.id,
        version=plan.version,
        changes={"item_added": data.model_dump()},
    )
    session.add(version_record)
    
    await session.flush()

    await publish_event(
        "TREATMENT_ITEM_ADDED",
        tenant_id=tenant_id,
        patient_id=plan.patient_id,
        payload={"treatment_plan_id": str(plan.id), "item_id": str(item.id), "version": plan.version},
    )

    return item


# ── Versions ────────────────────────────────────────────────────
async def get_plan_versions(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    plan_id: uuid.UUID,
) -> List[TreatmentPlanVersion]:
    result = await session.execute(
        select(TreatmentPlanVersion)
        .where(
            and_(
                TreatmentPlanVersion.treatment_plan_id == plan_id,
                TreatmentPlanVersion.tenant_id == tenant_id,
                TreatmentPlanVersion.deleted_at.is_(None),
            )
        )
        .order_by(desc(TreatmentPlanVersion.version))
    )
    return list(result.scalars().all())


# ── Adherence ───────────────────────────────────────────────────
async def record_adherence(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    plan_id: uuid.UUID,
    data: TreatmentAdherenceCreate,
) -> Optional[TreatmentAdherence]:
    plan = await get_plan(session, tenant_id, plan_id)
    if not plan:
        return None

    adherence = TreatmentAdherence(
        tenant_id=tenant_id,
        patient_id=plan.patient_id,
        treatment_plan_id=plan_id,
        adherence_status=data.adherence_status,
        notes=data.notes,
    )
    session.add(adherence)
    await session.flush()

    await publish_event(
        "ADHERENCE_RECORDED",
        tenant_id=tenant_id,
        patient_id=plan.patient_id,
        payload={
            "treatment_plan_id": str(plan.id),
            "adherence_status": data.adherence_status,
        },
    )

    return adherence
