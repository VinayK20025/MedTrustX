"""
MedTrustX Blood Bank Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.blood_bank import BloodUnit, Crossmatch, Donor, Transfusion
from src.schemas.blood_bank import (
    BloodUnitCreate,
    BloodUnitUpdate,
    CrossmatchCreate,
    DonorCreate,
    TransfusionCreate,
    TransfusionUpdate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Donors ──────────────────────────────────────────────────────
async def add_donor(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: DonorCreate,
) -> Donor:
    donor = Donor(
        tenant_id=tenant_id,
        name=data.name,
        blood_group=data.blood_group,
        eligibility_status=data.eligibility_status,
    )
    session.add(donor)
    await session.flush()
    return donor


async def get_donor(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    donor_id: uuid.UUID,
) -> Optional[Donor]:
    result = await session.execute(
        select(Donor).where(
            and_(
                Donor.id == donor_id,
                Donor.tenant_id == tenant_id,
                Donor.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Blood Units (Inventory) ─────────────────────────────────────
async def add_blood_unit(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: BloodUnitCreate,
) -> BloodUnit:
    unit = BloodUnit(
        tenant_id=tenant_id,
        donor_id=data.donor_id,
        blood_group=data.blood_group,
        component=data.component,
        collected_at=data.collected_at,
        expiry_date=data.expiry_date,
    )
    session.add(unit)
    await session.flush()

    if data.donor_id:
        donor = await get_donor(session, tenant_id, data.donor_id)
        if donor:
            donor.last_donation_date = data.collected_at
            await session.flush()

    await publish_event(
        "BLOOD_UNIT_ADDED",
        tenant_id=tenant_id,
        payload={"unit_id": str(unit.id), "blood_group": data.blood_group, "component": data.component},
    )
    return unit


async def update_blood_unit(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    unit_id: uuid.UUID,
    data: BloodUnitUpdate,
) -> Optional[BloodUnit]:
    result = await session.execute(
        select(BloodUnit).where(
            and_(
                BloodUnit.id == unit_id,
                BloodUnit.tenant_id == tenant_id,
                BloodUnit.deleted_at.is_(None),
            )
        )
    )
    unit = result.scalar_one_or_none()
    if not unit:
        return None

    if data.status != unit.status:
        unit.status = data.status
        unit.updated_at = datetime.now(timezone.utc)
        await session.flush()

        if data.status == "reserved":
            await publish_event(
                "BLOOD_UNIT_RESERVED",
                tenant_id=tenant_id,
                payload={"unit_id": str(unit.id)},
            )

    return unit


async def get_inventory(
    session: AsyncSession,
    tenant_id: uuid.UUID,
) -> List[BloodUnit]:
    result = await session.execute(
        select(BloodUnit)
        .where(
            and_(
                BloodUnit.tenant_id == tenant_id,
                BloodUnit.status == "available",
                BloodUnit.deleted_at.is_(None),
            )
        )
        .order_by(BloodUnit.expiry_date)
    )
    return list(result.scalars().all())


# ── Crossmatches ────────────────────────────────────────────────
async def record_crossmatch(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    data: CrossmatchCreate,
) -> Crossmatch:
    cm = Crossmatch(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        blood_unit_id=data.blood_unit_id,
        compatibility_status=data.compatibility_status,
        tested_by=user_id,
    )
    session.add(cm)
    await session.flush()

    await publish_event(
        "CROSSMATCH_COMPLETED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={
            "blood_unit_id": str(data.blood_unit_id),
            "status": data.compatibility_status,
        },
    )
    return cm


async def get_crossmatch(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    cm_id: uuid.UUID,
) -> Optional[Crossmatch]:
    result = await session.execute(
        select(Crossmatch).where(
            and_(
                Crossmatch.id == cm_id,
                Crossmatch.tenant_id == tenant_id,
                Crossmatch.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Transfusions ────────────────────────────────────────────────
async def record_transfusion(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    data: TransfusionCreate,
) -> Transfusion:
    transfusion = Transfusion(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        blood_unit_id=data.blood_unit_id,
        administered_by=user_id,
        notes=data.notes,
    )
    session.add(transfusion)
    
    # Mark unit as used automatically
    unit_result = await session.execute(select(BloodUnit).where(BloodUnit.id == data.blood_unit_id))
    unit = unit_result.scalar_one_or_none()
    if unit:
        unit.status = "used"
        unit.updated_at = datetime.now(timezone.utc)

    await session.flush()

    await publish_event(
        "TRANSFUSION_STARTED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"transfusion_id": str(transfusion.id), "blood_unit_id": str(data.blood_unit_id)},
    )
    return transfusion


async def update_transfusion(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    transfusion_id: uuid.UUID,
    data: TransfusionUpdate,
) -> Optional[Transfusion]:
    result = await session.execute(
        select(Transfusion).where(
            and_(
                Transfusion.id == transfusion_id,
                Transfusion.tenant_id == tenant_id,
                Transfusion.deleted_at.is_(None),
            )
        )
    )
    transfusion = result.scalar_one_or_none()
    if not transfusion:
        return None

    if data.notes:
        transfusion.notes = data.notes

    if data.status != transfusion.status:
        transfusion.status = data.status
        transfusion.updated_at = datetime.now(timezone.utc)
        await session.flush()

        if data.status == "completed":
            await publish_event(
                "TRANSFUSION_COMPLETED",
                tenant_id=tenant_id,
                patient_id=transfusion.patient_id,
                payload={"transfusion_id": str(transfusion.id)},
            )
        elif data.status == "reaction":
            await publish_event(
                "ADVERSE_REACTION_REPORTED",
                tenant_id=tenant_id,
                patient_id=transfusion.patient_id,
                payload={"transfusion_id": str(transfusion.id)},
            )

    return transfusion


async def get_patient_transfusions(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[Transfusion]:
    result = await session.execute(
        select(Transfusion)
        .where(
            and_(
                Transfusion.patient_id == patient_id,
                Transfusion.tenant_id == tenant_id,
                Transfusion.deleted_at.is_(None),
            )
        )
        .order_by(desc(Transfusion.administered_at))
    )
    return list(result.scalars().all())
