"""
MedTrustX Inventory Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.inventory import (
    InventoryItem,
    StockBatch,
    StockLevel,
    StockMovement,
    StockReservation,
)
from src.schemas.inventory import (
    InventoryItemCreate,
    StockBatchCreate,
    StockMovementCreate,
    StockReservationCreate,
    StockReservationUpdate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Inventory Items ─────────────────────────────────────────────
async def create_item(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: InventoryItemCreate,
) -> InventoryItem:
    item = InventoryItem(
        tenant_id=tenant_id,
        name=data.name,
        category=data.category,
        unit=data.unit,
    )
    session.add(item)
    await session.flush()

    # Initialize empty stock level
    level = StockLevel(
        tenant_id=tenant_id,
        item_id=item.id,
        available_quantity=0,
    )
    session.add(level)
    await session.flush()

    return item


async def get_item(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    item_id: uuid.UUID,
) -> Optional[InventoryItem]:
    result = await session.execute(
        select(InventoryItem)
        .where(
            and_(
                InventoryItem.id == item_id,
                InventoryItem.tenant_id == tenant_id,
                InventoryItem.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Stock Batches ───────────────────────────────────────────────
async def create_batch(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: StockBatchCreate,
) -> StockBatch:
    item = await get_item(session, tenant_id, data.item_id)
    if not item:
        raise ValueError("Inventory item not found")

    batch = StockBatch(
        tenant_id=tenant_id,
        item_id=data.item_id,
        batch_number=data.batch_number,
        quantity=data.quantity,
        expiry_date=data.expiry_date,
    )
    session.add(batch)
    await session.flush()

    # Automatically trigger an inbound movement for the new batch
    await create_movement(
        session,
        tenant_id,
        StockMovementCreate(
            item_id=data.item_id,
            movement_type="inbound",
            quantity=data.quantity,
            reference_id=batch.id,
        )
    )

    return batch


async def get_batch(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    batch_id: uuid.UUID,
) -> Optional[StockBatch]:
    result = await session.execute(
        select(StockBatch)
        .where(
            and_(
                StockBatch.id == batch_id,
                StockBatch.tenant_id == tenant_id,
                StockBatch.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Stock Movements (Inbound / Outbound) ────────────────────────
async def create_movement(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: StockMovementCreate,
) -> StockMovement:
    item = await get_item(session, tenant_id, data.item_id)
    if not item:
        raise ValueError("Inventory item not found")

    # Lock stock level for update to prevent concurrent race conditions
    level_result = await session.execute(
        select(StockLevel)
        .where(and_(StockLevel.item_id == data.item_id, StockLevel.tenant_id == tenant_id))
        .with_for_update()
    )
    level = level_result.scalar_one_or_none()
    
    if not level:
        raise ValueError("Stock level not found for item")

    # Validate outbound movements against available stock
    if data.movement_type in ("outbound", "write_off") and data.quantity < 0:
        if level.available_quantity + data.quantity < 0:
            raise ValueError(
                f"Insufficient stock. Available: {level.available_quantity}, Requested: {abs(data.quantity)}"
            )

    # Record Movement
    movement = StockMovement(
        tenant_id=tenant_id,
        item_id=data.item_id,
        movement_type=data.movement_type,
        quantity=data.quantity,
        reference_id=data.reference_id,
    )
    session.add(movement)

    # Update aggregated Stock Level
    level.available_quantity += data.quantity
    level.updated_at = datetime.now(timezone.utc)

    await session.flush()

    # Publish Events
    await publish_event(
        "STOCK_UPDATED",
        tenant_id=tenant_id,
        item_id=data.item_id,
        payload={
            "movement_type": data.movement_type,
            "quantity_change": data.quantity,
            "new_available_quantity": level.available_quantity,
        },
    )

    # Trigger low stock alert if needed (threshold hardcoded to 10 for demo)
    if level.available_quantity <= 10 and data.quantity < 0:
        await publish_event(
            "STOCK_LOW_ALERT",
            tenant_id=tenant_id,
            item_id=data.item_id,
            payload={
                "available_quantity": level.available_quantity,
                "threshold": 10,
            },
        )

    return movement


# ── Stock Reservations ──────────────────────────────────────────
async def create_reservation(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: StockReservationCreate,
) -> StockReservation:
    item = await get_item(session, tenant_id, data.item_id)
    if not item:
        raise ValueError("Inventory item not found")

    # Lock stock level
    level_result = await session.execute(
        select(StockLevel)
        .where(and_(StockLevel.item_id == data.item_id, StockLevel.tenant_id == tenant_id))
        .with_for_update()
    )
    level = level_result.scalar_one_or_none()

    if not level or level.available_quantity < data.reserved_quantity:
        available = level.available_quantity if level else 0
        raise ValueError(
            f"Insufficient stock for reservation. Available: {available}, Requested: {data.reserved_quantity}"
        )

    # Record Reservation
    reservation = StockReservation(
        tenant_id=tenant_id,
        item_id=data.item_id,
        reserved_quantity=data.reserved_quantity,
        reference_type=data.reference_type,
        reference_id=data.reference_id,
    )
    session.add(reservation)

    # Decrease available stock (it is now locked/reserved)
    level.available_quantity -= data.reserved_quantity
    level.updated_at = datetime.now(timezone.utc)

    await session.flush()

    await publish_event(
        "STOCK_RESERVED",
        tenant_id=tenant_id,
        item_id=data.item_id,
        payload={
            "reservation_id": str(reservation.id),
            "reserved_quantity": data.reserved_quantity,
            "reference_type": data.reference_type,
        },
    )

    return reservation


async def get_reservation(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    reservation_id: uuid.UUID,
) -> Optional[StockReservation]:
    result = await session.execute(
        select(StockReservation)
        .where(
            and_(
                StockReservation.id == reservation_id,
                StockReservation.tenant_id == tenant_id,
                StockReservation.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def get_stock_level(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    item_id: uuid.UUID,
) -> Optional[StockLevel]:
    result = await session.execute(
        select(StockLevel)
        .where(
            and_(
                StockLevel.item_id == item_id,
                StockLevel.tenant_id == tenant_id,
            )
        )
    )
    return result.scalar_one_or_none()
