"""
MedTrustX Insurance Integration Service — Business Logic Layer

Eligibility, pre-auth, claims, and remittances.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.insurance import (
    Claim,
    ClaimStatusUpdate,
    EligibilityCheck,
    Preauthorization,
    Remittance,
)
from src.schemas.insurance import (
    ClaimCreate,
    EligibilityCheckCreate,
    PreauthorizationCreate,
    RemittanceCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Eligibility ──

async def perform_eligibility_check(
    session: AsyncSession, tenant_id: uuid.UUID, data: EligibilityCheckCreate
) -> EligibilityCheck:
    # In a real system, this would call out to the payer API
    # Mocking standard verification
    check = EligibilityCheck(
        tenant_id=tenant_id,
        policy_id=data.policy_id,
        status="verified",
        response={"copay": 50, "deductible": 1000, "active": True},
    )
    session.add(check)
    await session.flush()
    await publish_event("ELIGIBILITY_VERIFIED", tenant_id, check.id, {"policy_id": str(data.policy_id)})
    return check


async def get_eligibility_check(
    session: AsyncSession, tenant_id: uuid.UUID, check_id: uuid.UUID
) -> Optional[EligibilityCheck]:
    result = await session.execute(
        select(EligibilityCheck).where(and_(EligibilityCheck.id == check_id, EligibilityCheck.tenant_id == tenant_id, EligibilityCheck.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Preauthorizations ──

async def submit_preauth(
    session: AsyncSession, tenant_id: uuid.UUID, data: PreauthorizationCreate
) -> Preauthorization:
    preauth = Preauthorization(
        tenant_id=tenant_id,
        encounter_id=data.encounter_id,
        request_payload=data.request_payload,
        status="submitted",
    )
    session.add(preauth)
    await session.flush()
    # Assume auto-approval for the demo
    preauth.status = "approved"
    preauth.reference_no = f"AUTH-{str(uuid.uuid4())[:8].upper()}"
    await publish_event("PREAUTH_APPROVED", tenant_id, preauth.id, {"encounter_id": str(data.encounter_id)})
    return preauth


async def get_preauth(
    session: AsyncSession, tenant_id: uuid.UUID, preauth_id: uuid.UUID
) -> Optional[Preauthorization]:
    result = await session.execute(
        select(Preauthorization).where(and_(Preauthorization.id == preauth_id, Preauthorization.tenant_id == tenant_id, Preauthorization.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Claims ──

async def submit_claim(
    session: AsyncSession, tenant_id: uuid.UUID, data: ClaimCreate
) -> Claim:
    claim = Claim(
        tenant_id=tenant_id,
        encounter_id=data.encounter_id,
        insurer_id=data.insurer_id,
        claim_amount=data.claim_amount,
        status="submitted",
        submitted_at=datetime.now(timezone.utc),
    )
    session.add(claim)
    await session.flush()
    
    status_update = ClaimStatusUpdate(
        tenant_id=tenant_id,
        claim_id=claim.id,
        payer_status="RECEIVED",
        internal_status="submitted",
    )
    session.add(status_update)
    
    await publish_event("CLAIM_SUBMITTED", tenant_id, claim.id, {"encounter_id": str(data.encounter_id), "amount": data.claim_amount})
    return claim


async def get_claim(
    session: AsyncSession, tenant_id: uuid.UUID, claim_id: uuid.UUID
) -> Optional[Claim]:
    result = await session.execute(
        select(Claim).where(and_(Claim.id == claim_id, Claim.tenant_id == tenant_id, Claim.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


async def get_claim_status(
    session: AsyncSession, tenant_id: uuid.UUID, claim_id: uuid.UUID
) -> List[ClaimStatusUpdate]:
    result = await session.execute(
        select(ClaimStatusUpdate).where(and_(ClaimStatusUpdate.claim_id == claim_id, ClaimStatusUpdate.tenant_id == tenant_id, ClaimStatusUpdate.deleted_at.is_(None)))
        .order_by(ClaimStatusUpdate.updated_at.desc())
    )
    return list(result.scalars().all())


# ── Remittances ──

async def process_remittance(
    session: AsyncSession, tenant_id: uuid.UUID, data: RemittanceCreate
) -> Remittance:
    remittance = Remittance(
        tenant_id=tenant_id,
        claim_id=data.claim_id,
        paid_amount=data.paid_amount,
        adjustments=data.adjustments,
    )
    session.add(remittance)
    
    claim = await get_claim(session, tenant_id, data.claim_id)
    if claim:
        claim.status = "paid"
        
    await session.flush()
    await publish_event("PAYMENT_POSTED", tenant_id, remittance.id, {"claim_id": str(data.claim_id), "paid_amount": data.paid_amount})
    return remittance
