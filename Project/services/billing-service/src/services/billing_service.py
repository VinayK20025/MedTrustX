"""
MedTrustX Billing Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.billing import (
    Adjustment,
    Charge,
    Invoice,
    InvoiceItem,
    Payment,
)
from src.schemas.billing import (
    AdjustmentCreate,
    ChargeCreate,
    InvoiceCreate,
    InvoiceUpdate,
    PaymentCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Charges ─────────────────────────────────────────────────────
async def create_charge(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: ChargeCreate,
) -> Charge:
    charge = Charge(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        service_type=data.service_type,
        reference_id=data.reference_id,
        amount=data.amount,
    )
    session.add(charge)
    await session.flush()

    await publish_event(
        "CHARGE_CREATED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={
            "charge_id": str(charge.id),
            "amount": float(charge.amount),
            "service_type": charge.service_type,
        },
    )

    return charge


async def get_charge(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    charge_id: uuid.UUID,
) -> Optional[Charge]:
    result = await session.execute(
        select(Charge)
        .where(
            and_(
                Charge.id == charge_id,
                Charge.tenant_id == tenant_id,
                Charge.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Invoices ────────────────────────────────────────────────────
async def create_invoice(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: InvoiceCreate,
) -> Invoice:
    # Calculate total
    total_amount = sum((item.amount for item in data.items), Decimal("0.00"))

    invoice = Invoice(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        total_amount=total_amount,
        status="issued",
        issued_at=datetime.now(timezone.utc),
        due_date=data.due_date,
    )
    session.add(invoice)
    await session.flush()

    # Add items and update linked charges
    for item_data in data.items:
        item = InvoiceItem(
            tenant_id=tenant_id,
            invoice_id=invoice.id,
            description=item_data.description,
            amount=item_data.amount,
            charge_id=item_data.charge_id,
        )
        session.add(item)
        
        # Mark the original charge as invoiced
        if item_data.charge_id:
            await session.execute(
                update(Charge)
                .where(Charge.id == item_data.charge_id)
                .values(status="invoiced")
            )

    await session.flush()

    await publish_event(
        "INVOICE_GENERATED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={
            "invoice_id": str(invoice.id),
            "total_amount": float(total_amount),
        },
    )

    return invoice


async def get_invoice(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    invoice_id: uuid.UUID,
) -> Optional[Invoice]:
    result = await session.execute(
        select(Invoice)
        .options(selectinload(Invoice.items))
        .where(
            and_(
                Invoice.id == invoice_id,
                Invoice.tenant_id == tenant_id,
                Invoice.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_invoice_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    invoice_id: uuid.UUID,
    data: InvoiceUpdate,
) -> Optional[Invoice]:
    invoice = await get_invoice(session, tenant_id, invoice_id)
    if not invoice:
        return None

    if invoice.status != data.status:
        invoice.status = data.status
        invoice.updated_at = datetime.now(timezone.utc)
        await session.flush()

    return invoice


# ── Payments ────────────────────────────────────────────────────
async def process_payment(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: PaymentCreate,
) -> Payment:
    # 1. Verify Invoice
    invoice = await get_invoice(session, tenant_id, data.invoice_id)
    if not invoice:
        raise ValueError("Invoice not found")

    if invoice.status == "paid":
        raise ValueError("Invoice is already fully paid")

    # 2. Record Payment
    payment = Payment(
        tenant_id=tenant_id,
        invoice_id=data.invoice_id,
        amount=data.amount,
        payment_method=data.payment_method,
        status="completed",
        paid_at=datetime.now(timezone.utc),
    )
    session.add(payment)
    await session.flush()

    # 3. Recalculate Invoice Status
    # Get all completed payments and adjustments
    payments_result = await session.execute(
        select(Payment).where(and_(Payment.invoice_id == invoice.id, Payment.status == "completed"))
    )
    total_paid = sum(p.amount for p in payments_result.scalars().all())

    adjust_result = await session.execute(
        select(Adjustment).where(Adjustment.invoice_id == invoice.id)
    )
    total_adjust = sum(a.amount for a in adjust_result.scalars().all())

    balance = invoice.total_amount + total_adjust - total_paid

    if balance <= 0:
        invoice.status = "paid"
    else:
        invoice.status = "partial"

    await session.flush()

    await publish_event(
        "PAYMENT_RECEIVED",
        tenant_id=tenant_id,
        patient_id=invoice.patient_id,
        payload={
            "payment_id": str(payment.id),
            "invoice_id": str(invoice.id),
            "amount": float(payment.amount),
            "remaining_balance": float(balance),
        },
    )

    return payment


async def get_payment(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    payment_id: uuid.UUID,
) -> Optional[Payment]:
    result = await session.execute(
        select(Payment)
        .where(
            and_(
                Payment.id == payment_id,
                Payment.tenant_id == tenant_id,
                Payment.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Adjustments ─────────────────────────────────────────────────
async def create_adjustment(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: AdjustmentCreate,
) -> Adjustment:
    # 1. Verify Invoice
    invoice = await get_invoice(session, tenant_id, data.invoice_id)
    if not invoice:
        raise ValueError("Invoice not found")

    # 2. Record Adjustment
    adjustment = Adjustment(
        tenant_id=tenant_id,
        invoice_id=data.invoice_id,
        adjustment_type=data.adjustment_type,
        amount=data.amount,
        reason=data.reason,
    )
    session.add(adjustment)
    await session.flush()
    
    return adjustment


async def get_adjustment(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    adjustment_id: uuid.UUID,
) -> Optional[Adjustment]:
    result = await session.execute(
        select(Adjustment)
        .where(
            and_(
                Adjustment.id == adjustment_id,
                Adjustment.tenant_id == tenant_id,
                Adjustment.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()
