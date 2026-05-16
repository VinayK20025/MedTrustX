"""
MedTrustX Pharmacy Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.pharmacy import Administration, Dispense, Prescription, PrescriptionItem
from src.schemas.pharmacy import (
    AdministrationCreate,
    DispenseCreate,
    PrescriptionCreate,
    PrescriptionItemUpdate,
    PrescriptionUpdate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Prescriptions ───────────────────────────────────────────────
async def create_prescription(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    data: PrescriptionCreate,
) -> Prescription:
    prescription = Prescription(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        prescribed_by=user_id,
    )
    session.add(prescription)
    
    # We must flush to get the prescription.id for the items
    await session.flush()

    for item_data in data.items:
        item = PrescriptionItem(
            tenant_id=tenant_id,
            prescription_id=prescription.id,
            drug_name=item_data.drug_name,
            dosage=item_data.dosage,
            frequency=item_data.frequency,
            duration=item_data.duration,
            route=item_data.route,
            instructions=item_data.instructions,
        )
        session.add(item)

    await session.flush()

    await publish_event(
        "PRESCRIPTION_CREATED",
        patient_id=data.patient_id,
        tenant_id=tenant_id,
        payload={"prescription_id": str(prescription.id), "item_count": len(data.items)},
    )
    return prescription


async def get_prescription(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    prescription_id: uuid.UUID,
    load_relations: bool = False,
) -> Optional[Prescription]:
    stmt = select(Prescription).where(
        and_(
            Prescription.id == prescription_id,
            Prescription.tenant_id == tenant_id,
            Prescription.deleted_at.is_(None),
        )
    )
    if load_relations:
        stmt = stmt.options(
            selectinload(Prescription.items).selectinload(PrescriptionItem.dispenses),
            selectinload(Prescription.items).selectinload(PrescriptionItem.administrations),
        )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def update_prescription(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    prescription_id: uuid.UUID,
    data: PrescriptionUpdate,
) -> Optional[Prescription]:
    prescription = await get_prescription(session, tenant_id, prescription_id)
    if not prescription:
        return None

    if data.status != prescription.status:
        prescription.status = data.status
        prescription.updated_at = datetime.now(timezone.utc)
        await session.flush()
        
        if data.status == "completed":
            await publish_event(
                "PRESCRIPTION_COMPLETED",
                patient_id=prescription.patient_id,
                tenant_id=tenant_id,
                payload={"prescription_id": str(prescription.id)},
            )

    return prescription


# ── Prescription Items ──────────────────────────────────────────
async def get_prescription_item(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    item_id: uuid.UUID,
) -> Optional[PrescriptionItem]:
    result = await session.execute(
        select(PrescriptionItem).where(
            and_(
                PrescriptionItem.id == item_id,
                PrescriptionItem.tenant_id == tenant_id,
                PrescriptionItem.deleted_at.is_(None),
            )
        ).options(selectinload(PrescriptionItem.prescription))
    )
    return result.scalar_one_or_none()


async def update_prescription_item(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    item_id: uuid.UUID,
    data: PrescriptionItemUpdate,
) -> Optional[PrescriptionItem]:
    item = await get_prescription_item(session, tenant_id, item_id)
    if not item:
        return None

    item.status = data.status
    item.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return item


# ── Dispenses ───────────────────────────────────────────────────
async def add_dispense(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    item_id: uuid.UUID,
    user_id: uuid.UUID,
    data: DispenseCreate,
) -> Optional[Dispense]:
    item = await get_prescription_item(session, tenant_id, item_id)
    if not item:
        return None

    dispense = Dispense(
        tenant_id=tenant_id,
        prescription_item_id=item_id,
        quantity=data.quantity,
        dispensed_by=user_id,
    )
    session.add(dispense)

    # Auto-update item status to dispensed
    if item.status == "pending":
        item.status = "dispensed"
        item.updated_at = datetime.now(timezone.utc)

    await session.flush()

    await publish_event(
        "DRUG_DISPENSED",
        patient_id=item.prescription.patient_id,
        tenant_id=tenant_id,
        payload={
            "prescription_item_id": str(item_id),
            "drug_name": item.drug_name,
            "quantity": data.quantity,
        },
    )

    return dispense


# ── Administrations ─────────────────────────────────────────────
async def add_administration(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    item_id: uuid.UUID,
    user_id: uuid.UUID,
    data: AdministrationCreate,
) -> Optional[Administration]:
    item = await get_prescription_item(session, tenant_id, item_id)
    if not item:
        return None

    admin = Administration(
        tenant_id=tenant_id,
        prescription_item_id=item_id,
        patient_id=item.prescription.patient_id,
        administered_by=user_id,
        status=data.status,
        notes=data.notes,
    )
    session.add(admin)
    await session.flush()

    if data.status == "given":
        await publish_event(
            "MEDICATION_ADMINISTERED",
            patient_id=item.prescription.patient_id,
            tenant_id=tenant_id,
            payload={
                "prescription_item_id": str(item_id),
                "drug_name": item.drug_name,
                "dosage": item.dosage,
            },
        )

    return admin


# ── Patient History ─────────────────────────────────────────────
async def get_patient_medications(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[Prescription]:
    result = await session.execute(
        select(Prescription)
        .where(
            and_(
                Prescription.patient_id == patient_id,
                Prescription.tenant_id == tenant_id,
                Prescription.deleted_at.is_(None),
            )
        )
        .options(
            selectinload(Prescription.items).selectinload(PrescriptionItem.dispenses),
            selectinload(Prescription.items).selectinload(PrescriptionItem.administrations),
        )
        .order_by(desc(Prescription.created_at))
    )
    return list(result.scalars().all())
