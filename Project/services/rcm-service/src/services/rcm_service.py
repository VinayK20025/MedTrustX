"""
MedTrustX RCM Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.rcm import (
    Adjudication,
    Claim,
    ClaimItem,
    Denial,
    Reimbursement,
)
from src.schemas.rcm import (
    AdjudicationCreate,
    ClaimCreate,
    ClaimUpdate,
    DenialCreate,
    ReimbursementCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Claims ──────────────────────────────────────────────────────
async def create_claim(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: ClaimCreate,
) -> Claim:
    # Calculate total
    claim_amount = sum((item.amount for item in data.items), Decimal("0.00"))

    claim = Claim(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        invoice_id=data.invoice_id,
        insurer=data.insurer,
        claim_amount=claim_amount,
        status="draft",
    )
    session.add(claim)
    await session.flush()

    for item_data in data.items:
        item = ClaimItem(
            tenant_id=tenant_id,
            claim_id=claim.id,
            description=item_data.description,
            amount=item_data.amount,
        )
        session.add(item)

    await session.flush()

    await publish_event(
        "CLAIM_CREATED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={
            "claim_id": str(claim.id),
            "invoice_id": str(claim.invoice_id),
            "amount": float(claim_amount),
        },
    )

    return claim


async def get_claim(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    claim_id: uuid.UUID,
) -> Optional[Claim]:
    result = await session.execute(
        select(Claim)
        .options(selectinload(Claim.items))
        .where(
            and_(
                Claim.id == claim_id,
                Claim.tenant_id == tenant_id,
                Claim.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_claim_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    claim_id: uuid.UUID,
    data: ClaimUpdate,
) -> Optional[Claim]:
    claim = await get_claim(session, tenant_id, claim_id)
    if not claim:
        return None

    if claim.status != data.status:
        claim.status = data.status
        if data.status == "submitted" and claim.submitted_at is None:
            claim.submitted_at = datetime.now(timezone.utc)
            await publish_event(
                "CLAIM_SUBMITTED",
                tenant_id=tenant_id,
                patient_id=claim.patient_id,
                payload={
                    "claim_id": str(claim.id),
                    "invoice_id": str(claim.invoice_id),
                },
            )

        claim.updated_at = datetime.now(timezone.utc)
        await session.flush()

    return claim


# ── Adjudications ───────────────────────────────────────────────
async def process_adjudication(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    claim_id: uuid.UUID,
    data: AdjudicationCreate,
) -> Adjudication:
    claim = await get_claim(session, tenant_id, claim_id)
    if not claim:
        raise ValueError("Claim not found")

    if claim.status in ("paid", "denied"):
        raise ValueError(f"Cannot adjudicate claim in status: {claim.status}")

    # Record adjudication
    adjudication = Adjudication(
        tenant_id=tenant_id,
        claim_id=claim.id,
        approved_amount=data.approved_amount,
        rejected_amount=data.rejected_amount,
        status=data.status,
    )
    session.add(adjudication)

    # Update claim status based on adjudication result
    if data.status == "completely_rejected":
        claim.status = "denied"
        event_type = "CLAIM_REJECTED"
    else:
        claim.status = "adjudicated"
        event_type = "CLAIM_APPROVED"

    claim.updated_at = datetime.now(timezone.utc)
    await session.flush()

    await publish_event(
        event_type,
        tenant_id=tenant_id,
        patient_id=claim.patient_id,
        payload={
            "claim_id": str(claim.id),
            "approved_amount": float(data.approved_amount),
            "rejected_amount": float(data.rejected_amount),
        },
    )

    return adjudication


# ── Reimbursements ──────────────────────────────────────────────
async def process_reimbursement(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    claim_id: uuid.UUID,
    data: ReimbursementCreate,
) -> Reimbursement:
    claim = await get_claim(session, tenant_id, claim_id)
    if not claim:
        raise ValueError("Claim not found")

    reimbursement = Reimbursement(
        tenant_id=tenant_id,
        claim_id=claim.id,
        amount=data.amount,
        payment_date=data.payment_date,
    )
    session.add(reimbursement)

    # Calculate total reimbursed against adjudication to mark as paid
    adj_result = await session.execute(
        select(Adjudication).where(Adjudication.claim_id == claim.id)
    )
    adjudication = adj_result.scalar_one_or_none()
    
    # We allow logging partial reimbursements even without adjudication 
    # but to mark fully paid, we check against adjudication.
    if adjudication:
        reimb_result = await session.execute(
            select(Reimbursement).where(Reimbursement.claim_id == claim.id)
        )
        total_reimbursed = sum(r.amount for r in reimb_result.scalars().all()) + data.amount
        
        if total_reimbursed >= adjudication.approved_amount:
            claim.status = "paid"
            claim.updated_at = datetime.now(timezone.utc)

    await session.flush()

    await publish_event(
        "REIMBURSEMENT_RECEIVED",
        tenant_id=tenant_id,
        patient_id=claim.patient_id,
        payload={
            "claim_id": str(claim.id),
            "invoice_id": str(claim.invoice_id),
            "amount": float(data.amount),
        },
    )

    return reimbursement


# ── Denials ─────────────────────────────────────────────────────
async def record_denial(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    claim_id: uuid.UUID,
    data: DenialCreate,
) -> Denial:
    claim = await get_claim(session, tenant_id, claim_id)
    if not claim:
        raise ValueError("Claim not found")

    denial = Denial(
        tenant_id=tenant_id,
        claim_id=claim.id,
        reason=data.reason,
    )
    session.add(denial)

    claim.status = "denied"
    claim.updated_at = datetime.now(timezone.utc)

    await session.flush()

    await publish_event(
        "CLAIM_REJECTED",
        tenant_id=tenant_id,
        patient_id=claim.patient_id,
        payload={
            "claim_id": str(claim.id),
            "reason": data.reason,
        },
    )

    return denial
