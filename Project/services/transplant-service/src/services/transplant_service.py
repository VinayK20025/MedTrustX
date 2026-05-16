"""
MedTrustX Transplant Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.transplant import Donor, Recipient, Waitlist, Match, Transplant
from src.schemas.transplant import (
    DonorCreate, DonorUpdate,
    RecipientCreate, WaitlistCreate,
    MatchCreate, TransplantCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Donors ──

async def create_donor(
    session: AsyncSession, tenant_id: uuid.UUID, data: DonorCreate
) -> Donor:
    donor = Donor(
        tenant_id=tenant_id,
        donor_type=data.donor_type,
        blood_group=data.blood_group,
        organ_type=data.organ_type,
        eligibility_status=data.eligibility_status,
    )
    session.add(donor)
    await session.flush()
    
    await publish_event("DONOR_REGISTERED", tenant_id, donor.id, {
        "donor_type": donor.donor_type,
        "organ_type": donor.organ_type,
        "blood_group": donor.blood_group,
    })
    
    return donor

async def get_donor(
    session: AsyncSession, tenant_id: uuid.UUID, donor_id: uuid.UUID
) -> Optional[Donor]:
    result = await session.execute(
        select(Donor).where(and_(Donor.id == donor_id, Donor.tenant_id == tenant_id, Donor.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_donor(
    session: AsyncSession, tenant_id: uuid.UUID, donor_id: uuid.UUID, data: DonorUpdate
) -> Optional[Donor]:
    donor = await get_donor(session, tenant_id, donor_id)
    if not donor:
        return None
        
    if data.eligibility_status:
        donor.eligibility_status = data.eligibility_status
        
    donor.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return donor

# ── Recipients ──

async def create_recipient(
    session: AsyncSession, tenant_id: uuid.UUID, data: RecipientCreate
) -> Recipient:
    recipient = Recipient(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        organ_needed=data.organ_needed,
        blood_group=data.blood_group,
        urgency_level=data.urgency_level,
    )
    session.add(recipient)
    await session.flush()
    
    await publish_event("RECIPIENT_LISTED", tenant_id, recipient.id, {
        "organ_needed": recipient.organ_needed,
        "blood_group": recipient.blood_group,
        "urgency_level": recipient.urgency_level,
    })
    
    return recipient

async def get_recipient(
    session: AsyncSession, tenant_id: uuid.UUID, recipient_id: uuid.UUID
) -> Optional[Recipient]:
    result = await session.execute(
        select(Recipient).where(and_(Recipient.id == recipient_id, Recipient.tenant_id == tenant_id, Recipient.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Waitlists ──

async def add_to_waitlist(
    session: AsyncSession, tenant_id: uuid.UUID, data: WaitlistCreate
) -> Waitlist:
    waitlist = Waitlist(
        tenant_id=tenant_id,
        organ_type=data.organ_type,
        recipient_id=data.recipient_id,
        priority_score=data.priority_score,
    )
    session.add(waitlist)
    await session.flush()
    return waitlist

async def get_waitlists(
    session: AsyncSession, tenant_id: uuid.UUID, organ_type: Optional[str] = None
) -> List[Waitlist]:
    query = select(Waitlist).where(and_(Waitlist.tenant_id == tenant_id, Waitlist.deleted_at.is_(None)))
    if organ_type:
        query = query.where(Waitlist.organ_type == organ_type)
    query = query.order_by(Waitlist.priority_score.desc())
    
    result = await session.execute(query)
    return list(result.scalars().all())

# ── Matches ──

async def create_match(
    session: AsyncSession, tenant_id: uuid.UUID, data: MatchCreate
) -> Match:
    match = Match(
        tenant_id=tenant_id,
        donor_id=data.donor_id,
        recipient_id=data.recipient_id,
        compatibility_score=data.compatibility_score,
    )
    session.add(match)
    await session.flush()
    
    await publish_event("MATCH_FOUND", tenant_id, match.id, {
        "donor_id": str(match.donor_id),
        "recipient_id": str(match.recipient_id),
        "compatibility_score": match.compatibility_score,
    })
    
    return match

async def get_match(
    session: AsyncSession, tenant_id: uuid.UUID, match_id: uuid.UUID
) -> Optional[Match]:
    result = await session.execute(
        select(Match).where(and_(Match.id == match_id, Match.tenant_id == tenant_id, Match.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Transplants ──

async def schedule_transplant(
    session: AsyncSession, tenant_id: uuid.UUID, data: TransplantCreate
) -> Transplant:
    transplant = Transplant(
        tenant_id=tenant_id,
        donor_id=data.donor_id,
        recipient_id=data.recipient_id,
        surgery_id=data.surgery_id,
    )
    session.add(transplant)
    await session.flush()
    
    await publish_event("ORGAN_ALLOCATED", tenant_id, transplant.id, {
        "donor_id": str(transplant.donor_id),
        "recipient_id": str(transplant.recipient_id),
        "surgery_id": str(transplant.surgery_id),
    })
    
    return transplant

async def get_transplant(
    session: AsyncSession, tenant_id: uuid.UUID, transplant_id: uuid.UUID
) -> Optional[Transplant]:
    result = await session.execute(
        select(Transplant).where(and_(Transplant.id == transplant_id, Transplant.tenant_id == tenant_id, Transplant.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()
