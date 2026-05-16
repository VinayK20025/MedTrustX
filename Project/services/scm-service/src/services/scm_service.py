"""
MedTrustX SCM Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.scm import (
    GoodsReceipt,
    PurchaseOrder,
    PurchaseOrderItem,
    Shipment,
    Vendor,
)
from src.schemas.scm import (
    GoodsReceiptCreate,
    GoodsReceiptUpdate,
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
    VendorCreate,
    VendorUpdate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Vendors ─────────────────────────────────────────────────────
async def create_vendor(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: VendorCreate,
) -> Vendor:
    vendor = Vendor(
        tenant_id=tenant_id,
        name=data.name,
        contact_info=data.contact_info,
    )
    session.add(vendor)
    await session.flush()
    return vendor


async def get_vendor(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    vendor_id: uuid.UUID,
) -> Optional[Vendor]:
    result = await session.execute(
        select(Vendor)
        .where(
            and_(
                Vendor.id == vendor_id,
                Vendor.tenant_id == tenant_id,
                Vendor.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_vendor_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    vendor_id: uuid.UUID,
    data: VendorUpdate,
) -> Optional[Vendor]:
    vendor = await get_vendor(session, tenant_id, vendor_id)
    if not vendor:
        return None

    if vendor.status != data.status:
        vendor.status = data.status
        vendor.updated_at = datetime.now(timezone.utc)
        await session.flush()

    return vendor


# ── Purchase Orders ─────────────────────────────────────────────
async def create_purchase_order(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: PurchaseOrderCreate,
) -> PurchaseOrder:
    vendor = await get_vendor(session, tenant_id, data.vendor_id)
    if not vendor or vendor.status != "active":
        raise ValueError("Invalid or inactive vendor")

    # Calculate total
    total_amount = sum((Decimal(item.quantity) * item.unit_price for item in data.items), Decimal("0.00"))

    po = PurchaseOrder(
        tenant_id=tenant_id,
        vendor_id=data.vendor_id,
        total_amount=total_amount,
        status="pending_approval",
    )
    session.add(po)
    await session.flush()

    for item_data in data.items:
        item = PurchaseOrderItem(
            tenant_id=tenant_id,
            purchase_order_id=po.id,
            item_id=item_data.item_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
        )
        session.add(item)

    await session.flush()

    await publish_event(
        "PURCHASE_ORDER_CREATED",
        tenant_id=tenant_id,
        po_id=po.id,
        payload={
            "vendor_id": str(vendor.id),
            "total_amount": float(total_amount),
        },
    )

    return po


async def get_purchase_order(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    po_id: uuid.UUID,
) -> Optional[PurchaseOrder]:
    result = await session.execute(
        select(PurchaseOrder)
        .options(selectinload(PurchaseOrder.items))
        .where(
            and_(
                PurchaseOrder.id == po_id,
                PurchaseOrder.tenant_id == tenant_id,
                PurchaseOrder.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_purchase_order_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    po_id: uuid.UUID,
    data: PurchaseOrderUpdate,
) -> Optional[PurchaseOrder]:
    po = await get_purchase_order(session, tenant_id, po_id)
    if not po:
        return None

    if po.status != data.status:
        po.status = data.status
        po.updated_at = datetime.now(timezone.utc)
        
        if data.status == "approved":
            po.approved_at = datetime.now(timezone.utc)
            await publish_event(
                "PURCHASE_ORDER_APPROVED",
                tenant_id=tenant_id,
                po_id=po.id,
                payload={"vendor_id": str(po.vendor_id)},
            )
            
        await session.flush()

    return po


# ── Goods Receipts ──────────────────────────────────────────────
async def create_goods_receipt(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: GoodsReceiptCreate,
) -> GoodsReceipt:
    po = await get_purchase_order(session, tenant_id, data.purchase_order_id)
    if not po:
        raise ValueError("Purchase order not found")
        
    if po.status not in ("approved", "dispatched", "fulfilled"):
        raise ValueError(f"Cannot receive goods for PO in status: {po.status}")

    receipt = GoodsReceipt(
        tenant_id=tenant_id,
        purchase_order_id=po.id,
        received_by=data.received_by,
        status="pending_qa",
    )
    session.add(receipt)
    await session.flush()

    return receipt


async def update_goods_receipt_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    receipt_id: uuid.UUID,
    data: GoodsReceiptUpdate,
) -> Optional[GoodsReceipt]:
    result = await session.execute(
        select(GoodsReceipt)
        .where(
            and_(
                GoodsReceipt.id == receipt_id,
                GoodsReceipt.tenant_id == tenant_id,
                GoodsReceipt.deleted_at.is_(None),
            )
        )
    )
    receipt = result.scalar_one_or_none()
    
    if not receipt:
        return None

    if receipt.status != data.status:
        receipt.status = data.status
        receipt.updated_at = datetime.now(timezone.utc)
        await session.flush()

        if data.status == "accepted":
            # Auto-update PO status to fulfilled if goods accepted
            po = await get_purchase_order(session, tenant_id, receipt.purchase_order_id)
            if po:
                po.status = "fulfilled"
                po.updated_at = datetime.now(timezone.utc)
                await session.flush()

            await publish_event(
                "GOODS_RECEIVED",
                tenant_id=tenant_id,
                po_id=receipt.purchase_order_id,
                payload={"receipt_id": str(receipt.id), "status": "accepted"},
            )

    return receipt


async def get_goods_receipt(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    receipt_id: uuid.UUID,
) -> Optional[GoodsReceipt]:
    result = await session.execute(
        select(GoodsReceipt)
        .where(
            and_(
                GoodsReceipt.id == receipt_id,
                GoodsReceipt.tenant_id == tenant_id,
                GoodsReceipt.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Shipments ───────────────────────────────────────────────────
async def get_shipment(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    shipment_id: uuid.UUID,
) -> Optional[Shipment]:
    result = await session.execute(
        select(Shipment)
        .where(
            and_(
                Shipment.id == shipment_id,
                Shipment.tenant_id == tenant_id,
                Shipment.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()
