"""
MedTrustX Bed Management Service — Business Logic Layer

Core bed management operations:
  - Bed inventory CRUD with status lifecycle
  - Bed allocation (patient admission) with transactional safety
  - Bed reservation (pre-booking)
  - Bed-to-bed transfers
  - Real-time availability dashboard
  - Status audit logging
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.beds import (
    Bed,
    BedAllocation,
    BedReservation,
    BedStatusLog,
    BedTransfer,
)
from src.schemas.beds import (
    BedAllocationCreate,
    BedAllocationUpdate,
    BedCreate,
    BedReservationCreate,
    BedReservationUpdate,
    BedTransferCreate,
    BedUpdate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ═══════════════════════════════════════════════════════════════
#  Beds (Inventory)
# ═══════════════════════════════════════════════════════════════

async def create_bed(
    session: AsyncSession, tenant_id: uuid.UUID, data: BedCreate,
) -> Bed:
    bed = Bed(
        tenant_id=tenant_id,
        room_id=data.room_id,
        bed_number=data.bed_number,
        type=data.type,
        ward=data.ward,
        floor=data.floor,
        features=data.features,
    )
    session.add(bed)
    await session.flush()

    # Log initial status
    log = BedStatusLog(
        tenant_id=tenant_id, bed_id=bed.id,
        old_status=None, new_status="available",
    )
    session.add(log)
    await session.flush()

    await publish_event("BED_STATUS_UPDATED", tenant_id, bed.id, {
        "bed_number": bed.bed_number, "status": "available", "type": bed.type,
    })
    return bed


async def get_bed(
    session: AsyncSession, tenant_id: uuid.UUID, bed_id: uuid.UUID,
) -> Optional[Bed]:
    result = await session.execute(
        select(Bed)
        .options(
            selectinload(Bed.allocations),
            selectinload(Bed.reservations),
        )
        .where(and_(
            Bed.id == bed_id,
            Bed.tenant_id == tenant_id,
            Bed.deleted_at.is_(None),
        ))
    )
    return result.scalar_one_or_none()


async def update_bed(
    session: AsyncSession, tenant_id: uuid.UUID, bed_id: uuid.UUID,
    data: BedUpdate, changed_by: Optional[uuid.UUID] = None,
) -> Optional[Bed]:
    bed = await get_bed(session, tenant_id, bed_id)
    if not bed:
        return None

    if data.status and data.status != bed.status:
        old_status = bed.status
        bed.status = data.status

        # Log status change
        log = BedStatusLog(
            tenant_id=tenant_id, bed_id=bed.id,
            old_status=old_status, new_status=data.status,
            changed_by=changed_by,
        )
        session.add(log)

        await publish_event("BED_STATUS_UPDATED", tenant_id, bed.id, {
            "bed_number": bed.bed_number,
            "old_status": old_status,
            "new_status": data.status,
        })

    if data.type:
        bed.type = data.type
    if data.ward is not None:
        bed.ward = data.ward
    if data.features is not None:
        bed.features = data.features

    bed.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return bed


async def list_beds(
    session: AsyncSession, tenant_id: uuid.UUID,
    *, status: Optional[str] = None, ward: Optional[str] = None,
    bed_type: Optional[str] = None, page: int = 1, page_size: int = 50,
) -> Tuple[List[Bed], int]:
    query = select(Bed).where(and_(
        Bed.tenant_id == tenant_id, Bed.deleted_at.is_(None),
    ))
    if status:
        query = query.where(Bed.status == status)
    if ward:
        query = query.where(Bed.ward == ward)
    if bed_type:
        query = query.where(Bed.type == bed_type)

    count_result = await session.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar() or 0

    offset = (page - 1) * page_size
    result = await session.execute(
        query.order_by(Bed.bed_number).limit(page_size).offset(offset)
    )
    return list(result.scalars().all()), total


# ═══════════════════════════════════════════════════════════════
#  Bed Allocations
# ═══════════════════════════════════════════════════════════════

async def create_allocation(
    session: AsyncSession, tenant_id: uuid.UUID, data: BedAllocationCreate,
) -> BedAllocation:
    bed = await get_bed(session, tenant_id, data.bed_id)
    if not bed:
        raise ValueError("Bed not found")
    if bed.status != "available":
        raise ValueError(f"Bed is not available (current: {bed.status})")

    # Check for existing active allocation
    existing = await session.execute(
        select(BedAllocation).where(and_(
            BedAllocation.bed_id == data.bed_id,
            BedAllocation.tenant_id == tenant_id,
            BedAllocation.status == "active",
        ))
    )
    if existing.scalar_one_or_none():
        raise ValueError("Bed already has an active allocation")

    allocation = BedAllocation(
        tenant_id=tenant_id,
        bed_id=data.bed_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        admission_type=data.admission_type,
        notes=data.notes,
    )
    session.add(allocation)

    # Mark bed as occupied
    bed.status = "occupied"
    bed.updated_at = datetime.now(timezone.utc)

    log = BedStatusLog(
        tenant_id=tenant_id, bed_id=bed.id,
        old_status="available", new_status="occupied",
        reason=f"Patient {data.patient_id} allocated",
    )
    session.add(log)
    await session.flush()

    logger.info("bed_allocated", bed_id=str(bed.id), patient_id=str(data.patient_id))

    await publish_event("BED_ALLOCATED", tenant_id, allocation.id, {
        "bed_id": str(bed.id), "bed_number": bed.bed_number,
        "patient_id": str(data.patient_id),
        "admission_type": data.admission_type,
    })
    return allocation


async def get_allocation(
    session: AsyncSession, tenant_id: uuid.UUID, allocation_id: uuid.UUID,
) -> Optional[BedAllocation]:
    result = await session.execute(
        select(BedAllocation).where(and_(
            BedAllocation.id == allocation_id,
            BedAllocation.tenant_id == tenant_id,
            BedAllocation.deleted_at.is_(None),
        ))
    )
    return result.scalar_one_or_none()


async def update_allocation(
    session: AsyncSession, tenant_id: uuid.UUID,
    allocation_id: uuid.UUID, data: BedAllocationUpdate,
) -> Optional[BedAllocation]:
    alloc = await get_allocation(session, tenant_id, allocation_id)
    if not alloc:
        return None

    if data.status and data.status != alloc.status:
        alloc.status = data.status
        alloc.updated_at = datetime.now(timezone.utc)

        if data.status in ("completed", "cancelled"):
            alloc.released_at = datetime.now(timezone.utc)

            # Free the bed → set to cleaning
            bed = await get_bed(session, tenant_id, alloc.bed_id)
            if bed and bed.status == "occupied":
                bed.status = "cleaning"
                bed.updated_at = datetime.now(timezone.utc)

                log = BedStatusLog(
                    tenant_id=tenant_id, bed_id=bed.id,
                    old_status="occupied", new_status="cleaning",
                    reason=f"Patient discharged ({data.status})",
                )
                session.add(log)

                await publish_event("BED_STATUS_UPDATED", tenant_id, bed.id, {
                    "bed_number": bed.bed_number,
                    "old_status": "occupied", "new_status": "cleaning",
                })

            await publish_event("BED_RELEASED", tenant_id, alloc.id, {
                "bed_id": str(alloc.bed_id),
                "patient_id": str(alloc.patient_id),
            })

    if data.notes is not None:
        alloc.notes = data.notes

    await session.flush()
    return alloc


# ═══════════════════════════════════════════════════════════════
#  Bed Reservations
# ═══════════════════════════════════════════════════════════════

async def create_reservation(
    session: AsyncSession, tenant_id: uuid.UUID, data: BedReservationCreate,
) -> BedReservation:
    bed = await get_bed(session, tenant_id, data.bed_id)
    if not bed:
        raise ValueError("Bed not found")
    if bed.status not in ("available",):
        raise ValueError(f"Bed cannot be reserved (current: {bed.status})")

    reservation = BedReservation(
        tenant_id=tenant_id,
        bed_id=data.bed_id,
        reserved_for=data.reserved_for,
        reference_id=data.reference_id,
        patient_id=data.patient_id,
        expected_arrival=data.expected_arrival,
        expires_at=data.expires_at,
        notes=data.notes,
    )
    session.add(reservation)

    bed.status = "reserved"
    bed.updated_at = datetime.now(timezone.utc)

    log = BedStatusLog(
        tenant_id=tenant_id, bed_id=bed.id,
        old_status="available", new_status="reserved",
        reason=f"Reserved for {data.reserved_for}",
    )
    session.add(log)
    await session.flush()

    await publish_event("BED_RESERVED", tenant_id, reservation.id, {
        "bed_id": str(bed.id), "bed_number": bed.bed_number,
        "reserved_for": data.reserved_for,
    })
    return reservation


async def get_reservation(
    session: AsyncSession, tenant_id: uuid.UUID, reservation_id: uuid.UUID,
) -> Optional[BedReservation]:
    result = await session.execute(
        select(BedReservation).where(and_(
            BedReservation.id == reservation_id,
            BedReservation.tenant_id == tenant_id,
            BedReservation.deleted_at.is_(None),
        ))
    )
    return result.scalar_one_or_none()


async def update_reservation(
    session: AsyncSession, tenant_id: uuid.UUID,
    reservation_id: uuid.UUID, data: BedReservationUpdate,
) -> Optional[BedReservation]:
    resv = await get_reservation(session, tenant_id, reservation_id)
    if not resv:
        return None

    if data.status != resv.status:
        resv.status = data.status
        resv.updated_at = datetime.now(timezone.utc)

        if data.status in ("cancelled", "expired"):
            bed = await get_bed(session, tenant_id, resv.bed_id)
            if bed and bed.status == "reserved":
                bed.status = "available"
                bed.updated_at = datetime.now(timezone.utc)
                log = BedStatusLog(
                    tenant_id=tenant_id, bed_id=bed.id,
                    old_status="reserved", new_status="available",
                    reason=f"Reservation {data.status}",
                )
                session.add(log)

            await publish_event("BED_RESERVATION_CANCELLED", tenant_id, resv.id, {
                "bed_id": str(resv.bed_id),
            })

    await session.flush()
    return resv


# ═══════════════════════════════════════════════════════════════
#  Bed Transfers
# ═══════════════════════════════════════════════════════════════

async def create_transfer(
    session: AsyncSession, tenant_id: uuid.UUID,
    data: BedTransferCreate, initiated_by: Optional[uuid.UUID] = None,
) -> BedTransfer:
    from_bed = await get_bed(session, tenant_id, data.from_bed_id)
    to_bed = await get_bed(session, tenant_id, data.to_bed_id)

    if not from_bed:
        raise ValueError("Source bed not found")
    if not to_bed:
        raise ValueError("Destination bed not found")
    if to_bed.status != "available":
        raise ValueError(f"Destination bed not available (current: {to_bed.status})")

    transfer = BedTransfer(
        tenant_id=tenant_id,
        from_bed_id=data.from_bed_id,
        to_bed_id=data.to_bed_id,
        patient_id=data.patient_id,
        reason=data.reason,
        initiated_by=initiated_by,
        notes=data.notes,
    )
    session.add(transfer)

    # Release source bed → cleaning
    from_bed.status = "cleaning"
    from_bed.updated_at = datetime.now(timezone.utc)
    session.add(BedStatusLog(
        tenant_id=tenant_id, bed_id=from_bed.id,
        old_status="occupied", new_status="cleaning",
        changed_by=initiated_by, reason=f"Transfer out: {data.reason}",
    ))

    # Occupy destination bed
    to_bed.status = "occupied"
    to_bed.updated_at = datetime.now(timezone.utc)
    session.add(BedStatusLog(
        tenant_id=tenant_id, bed_id=to_bed.id,
        old_status="available", new_status="occupied",
        changed_by=initiated_by, reason=f"Transfer in: {data.reason}",
    ))

    # Complete old allocation, create new one
    old_alloc_result = await session.execute(
        select(BedAllocation).where(and_(
            BedAllocation.bed_id == data.from_bed_id,
            BedAllocation.patient_id == data.patient_id,
            BedAllocation.tenant_id == tenant_id,
            BedAllocation.status == "active",
        ))
    )
    old_alloc = old_alloc_result.scalar_one_or_none()
    if old_alloc:
        old_alloc.status = "completed"
        old_alloc.released_at = datetime.now(timezone.utc)

    new_alloc = BedAllocation(
        tenant_id=tenant_id,
        bed_id=data.to_bed_id,
        patient_id=data.patient_id,
        encounter_id=old_alloc.encounter_id if old_alloc else None,
        admission_type="transfer_in",
    )
    session.add(new_alloc)
    await session.flush()

    logger.info("bed_transfer", from_bed=str(data.from_bed_id), to_bed=str(data.to_bed_id))

    await publish_event("BED_TRANSFERRED", tenant_id, transfer.id, {
        "from_bed_id": str(data.from_bed_id),
        "to_bed_id": str(data.to_bed_id),
        "patient_id": str(data.patient_id),
        "reason": data.reason,
    })
    return transfer


async def get_transfer(
    session: AsyncSession, tenant_id: uuid.UUID, transfer_id: uuid.UUID,
) -> Optional[BedTransfer]:
    result = await session.execute(
        select(BedTransfer).where(and_(
            BedTransfer.id == transfer_id,
            BedTransfer.tenant_id == tenant_id,
            BedTransfer.deleted_at.is_(None),
        ))
    )
    return result.scalar_one_or_none()


# ═══════════════════════════════════════════════════════════════
#  Availability Dashboard
# ═══════════════════════════════════════════════════════════════

async def get_availability(
    session: AsyncSession, tenant_id: uuid.UUID,
) -> dict:
    """Calculate real-time bed availability across all wards and types."""
    result = await session.execute(
        select(Bed).where(and_(
            Bed.tenant_id == tenant_id, Bed.deleted_at.is_(None),
        ))
    )
    beds = list(result.scalars().all())
    total = len(beds)

    status_counts: Dict[str, int] = {}
    ward_data: Dict[str, Dict[str, int]] = {}
    type_data: Dict[str, Dict[str, int]] = {}

    for bed in beds:
        # Overall status
        status_counts[bed.status] = status_counts.get(bed.status, 0) + 1

        # By ward
        w = bed.ward or "unassigned"
        if w not in ward_data:
            ward_data[w] = {}
        ward_data[w][bed.status] = ward_data[w].get(bed.status, 0) + 1

        # By type
        if bed.type not in type_data:
            type_data[bed.type] = {}
        type_data[bed.type][bed.status] = type_data[bed.type].get(bed.status, 0) + 1

    occupied = status_counts.get("occupied", 0)
    rate = (occupied / total * 100.0) if total > 0 else 0.0

    by_ward = []
    for ward_name, statuses in ward_data.items():
        w_total = sum(statuses.values())
        w_occupied = statuses.get("occupied", 0)
        by_ward.append({
            "ward": ward_name,
            "total": w_total,
            "available": statuses.get("available", 0),
            "occupied": w_occupied,
            "reserved": statuses.get("reserved", 0),
            "cleaning": statuses.get("cleaning", 0),
            "maintenance": statuses.get("maintenance", 0),
            "blocked": statuses.get("blocked", 0),
            "occupancy_rate": (w_occupied / w_total * 100.0) if w_total > 0 else 0.0,
        })

    return {
        "total_beds": total,
        "available": status_counts.get("available", 0),
        "occupied": occupied,
        "reserved": status_counts.get("reserved", 0),
        "cleaning": status_counts.get("cleaning", 0),
        "maintenance": status_counts.get("maintenance", 0),
        "blocked": status_counts.get("blocked", 0),
        "overall_occupancy_rate": round(rate, 1),
        "by_ward": by_ward,
        "by_type": type_data,
    }
