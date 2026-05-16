"""
MedTrustX Orders Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.orders import Order, OrderItem, OrderRoute, OrderDependency, OrderEvent
from src.schemas.orders import (
    OrderCreate,
    OrderUpdate,
    OrderItemCreate,
    OrderRouteCreate,
    OrderEventCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Orders ──

async def create_order(
    session: AsyncSession, tenant_id: uuid.UUID, data: OrderCreate
) -> Order:
    order = Order(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        order_type=data.order_type,
        status=data.status or "pending",
        created_by=data.created_by,
    )
    session.add(order)
    await session.flush()

    if data.items:
        for item_data in data.items:
            item = OrderItem(
                tenant_id=tenant_id,
                order_id=order.id,
                item_type=item_data.item_type,
                reference_id=item_data.reference_id,
                status=item_data.status or "pending",
            )
            session.add(item)

    if data.dependencies:
        for dep_id in data.dependencies:
            dep = OrderDependency(
                tenant_id=tenant_id,
                order_id=order.id,
                depends_on_order_id=dep_id,
            )
            session.add(dep)

    event = OrderEvent(
        tenant_id=tenant_id,
        order_id=order.id,
        event_type="ORDER_CREATED",
        description=f"Order {order.id} created.",
    )
    session.add(event)
    await session.flush()

    await publish_event("ORDER_CREATED", tenant_id, order.id, {
        "order_id": str(order.id),
        "patient_id": str(order.patient_id),
        "order_type": order.order_type,
    })
    return order

async def get_order(
    session: AsyncSession, tenant_id: uuid.UUID, order_id: uuid.UUID
) -> Optional[Order]:
    result = await session.execute(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.routes),
            selectinload(Order.events),
        )
        .where(and_(Order.id == order_id, Order.tenant_id == tenant_id, Order.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_order(
    session: AsyncSession, tenant_id: uuid.UUID, order_id: uuid.UUID, data: OrderUpdate
) -> Optional[Order]:
    order = await get_order(session, tenant_id, order_id)
    if not order:
        return None

    if data.status and data.status != order.status:
        order.status = data.status
        order.updated_at = datetime.now(timezone.utc)

        event = OrderEvent(
            tenant_id=tenant_id,
            order_id=order.id,
            event_type="ORDER_STATUS_CHANGED",
            description=f"Status changed to {data.status}",
        )
        session.add(event)

        event_name = "ORDER_COMPLETED" if data.status == "completed" else "ORDER_CANCELLED" if data.status == "cancelled" else "ORDER_UPDATED"
        await publish_event(event_name, tenant_id, order.id, {
            "order_id": str(order.id),
            "status": order.status,
        })

    await session.flush()
    return order

async def list_orders(
    session: AsyncSession, tenant_id: uuid.UUID, page: int = 1, page_size: int = 50
) -> Tuple[List[Order], int]:
    query = select(Order).where(and_(Order.tenant_id == tenant_id, Order.deleted_at.is_(None)))
    count_result = await session.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    offset = (page - 1) * page_size
    result = await session.execute(query.order_by(Order.created_at.desc()).limit(page_size).offset(offset))
    return list(result.scalars().all()), total

async def list_orders_by_patient(
    session: AsyncSession, tenant_id: uuid.UUID, patient_id: uuid.UUID
) -> List[Order]:
    result = await session.execute(
        select(Order)
        .where(and_(Order.tenant_id == tenant_id, Order.patient_id == patient_id, Order.deleted_at.is_(None)))
        .order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())

# ── Items ──

async def add_order_items(
    session: AsyncSession, tenant_id: uuid.UUID, order_id: uuid.UUID, items: List[OrderItemCreate]
) -> List[OrderItem]:
    order = await get_order(session, tenant_id, order_id)
    if not order:
        raise ValueError("Order not found")

    new_items = []
    for item_data in items:
        item = OrderItem(
            tenant_id=tenant_id,
            order_id=order.id,
            item_type=item_data.item_type,
            reference_id=item_data.reference_id,
            status=item_data.status or "pending",
        )
        session.add(item)
        new_items.append(item)
    await session.flush()
    return new_items

async def get_order_items(
    session: AsyncSession, tenant_id: uuid.UUID, order_id: uuid.UUID
) -> List[OrderItem]:
    result = await session.execute(
        select(OrderItem).where(and_(OrderItem.tenant_id == tenant_id, OrderItem.order_id == order_id, OrderItem.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

# ── Routes ──

async def route_order(
    session: AsyncSession, tenant_id: uuid.UUID, order_id: uuid.UUID, data: OrderRouteCreate
) -> OrderRoute:
    order = await get_order(session, tenant_id, order_id)
    if not order:
        raise ValueError("Order not found")

    route = OrderRoute(
        tenant_id=tenant_id,
        order_id=order.id,
        target_service=data.target_service,
        status=data.status or "routed",
    )
    session.add(route)

    event = OrderEvent(
        tenant_id=tenant_id,
        order_id=order.id,
        event_type="ORDER_ROUTED",
        description=f"Routed to {data.target_service}",
    )
    session.add(event)
    await session.flush()

    await publish_event("ORDER_ROUTED", tenant_id, order.id, {
        "order_id": str(order.id),
        "target_service": data.target_service,
    })
    return route

# ── Events ──

async def add_order_event(
    session: AsyncSession, tenant_id: uuid.UUID, order_id: uuid.UUID, data: OrderEventCreate
) -> OrderEvent:
    order = await get_order(session, tenant_id, order_id)
    if not order:
        raise ValueError("Order not found")

    event = OrderEvent(
        tenant_id=tenant_id,
        order_id=order.id,
        event_type=data.event_type,
        description=data.description,
    )
    session.add(event)
    await session.flush()
    return event
