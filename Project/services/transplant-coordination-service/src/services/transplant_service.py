"""
MedTrustX Transplant Coordination Service — Business Logic Layer

Donors, recipients, waitlists, matches, and events.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.transplant import (
    Donor,
    Match,
    Recipient,
    TransplantEvent,
    Waitlist,
)
from src.schemas.transplant import (
    DonorCreate,
    MatchCreate,
    RecipientCreate,
    WaitlistCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Donors ──

async def register_donor(
    session: AsyncSession, tenant_id: uuid.UUID, data: DonorCreate
) -> Donor:
    donor = Donor(
        tenant_id=tenant_id,
        donor_type=data.donor_type,
        blood_group=data.blood_group,
    )
    session.add(donor)
    await session.flush()
    await publish_event("DONOR_REGISTERED", tenant_id, donor.id, {"blood_group": data.blood_group})
    return donor


async def get_donor(
    session: AsyncSession, tenant_id: uuid.UUID, donor_id: uuid.UUID
) -> Optional[Donor]:
    result = await session.execute(
        select(Donor).where(and_(Donor.id == donor_id, Donor.tenant_id == tenant_id, Donor.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Recipients ──

async def register_recipient(
    session: AsyncSession, tenant_id: uuid.UUID, data: RecipientCreate
) -> Recipient:
    recipient = Recipient(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        organ_needed=data.organ_needed,
        priority=data.priority,
    )
    session.add(recipient)
    await session.flush()
    
    # Auto-add to waitlist
    waitlist = Waitlist(
        tenant_id=tenant_id,
        recipient_id=recipient.id,
        position=data.priority * 10,  # mock prioritization logic
    )
    session.add(waitlist)
    await session.flush()
    
    await publish_event("RECIPIENT_ADDED", tenant_id, recipient.id, {"organ_needed": data.organ_needed})
    return recipient


async def get_recipient(
    session: AsyncSession, tenant_id: uuid.UUID, recipient_id: uuid.UUID
) -> Optional[Recipient]:
    result = await session.execute(
        select(Recipient).where(and_(Recipient.id == recipient_id, Recipient.tenant_id == tenant_id, Recipient.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Waitlists ──

async def get_waitlists(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[Waitlist]:
    result = await session.execute(
        select(Waitlist).where(and_(Waitlist.tenant_id == tenant_id, Waitlist.deleted_at.is_(None)))
        .order_by(Waitlist.position.desc())
    )
    return list(result.scalars().all())


# ── Matches ──

async def create_match(
    session: AsyncSession, tenant_id: uuid.UUID, data: MatchCreate
) -> Match:
    match = Match(
        tenant_id=tenant_id,
        donor_id=data.donor_id,
        recipient_id=data.recipient_id,
        match_score=data.match_score,
    )
    session.add(match)
    await session.flush()
    
    # Audit log
    event = TransplantEvent(
        tenant_id=tenant_id,
        event_type="MATCH_FOUND",
        payload={"donor_id": str(data.donor_id), "recipient_id": str(data.recipient_id), "score": data.match_score}
    )
    session.add(event)
    await session.flush()
    
    await publish_event("MATCH_FOUND", tenant_id, match.id, {"score": data.match_score})
    return match


async def get_match(
    session: AsyncSession, tenant_id: uuid.UUID, match_id: uuid.UUID
) -> Optional[Match]:
    result = await session.execute(
        select(Match).where(and_(Match.id == match_id, Match.tenant_id == tenant_id, Match.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Transplant Events ──

async def get_transplant_events(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[TransplantEvent]:
    result = await session.execute(
        select(TransplantEvent).where(and_(TransplantEvent.tenant_id == tenant_id, TransplantEvent.deleted_at.is_(None)))
        .order_by(TransplantEvent.created_at.desc())
    )
    return list(result.scalars().all())
