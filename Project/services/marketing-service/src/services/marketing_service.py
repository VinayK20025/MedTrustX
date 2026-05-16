"""
MedTrustX Marketing Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.marketing import (
    Campaign, CampaignTarget, Segment, EngagementEvent, Funnel
)
from src.schemas.marketing import (
    CampaignCreate, CampaignUpdate, CampaignTargetCreate,
    SegmentCreate, EngagementEventCreate, FunnelCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Campaigns ──

async def create_campaign(
    session: AsyncSession, tenant_id: uuid.UUID, data: CampaignCreate
) -> Campaign:
    campaign = Campaign(
        tenant_id=tenant_id,
        name=data.name,
        channel=data.channel,
        status=data.status,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    session.add(campaign)
    await session.flush()
    
    await publish_event("CAMPAIGN_CREATED", tenant_id, campaign.id, {"name": campaign.name, "channel": campaign.channel})
    return campaign

async def get_campaign(
    session: AsyncSession, tenant_id: uuid.UUID, campaign_id: uuid.UUID
) -> Optional[Campaign]:
    result = await session.execute(
        select(Campaign).where(and_(Campaign.id == campaign_id, Campaign.tenant_id == tenant_id, Campaign.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_campaign(
    session: AsyncSession, tenant_id: uuid.UUID, campaign_id: uuid.UUID, data: CampaignUpdate
) -> Optional[Campaign]:
    campaign = await get_campaign(session, tenant_id, campaign_id)
    if not campaign:
        return None
    
    old_status = campaign.status
    
    if data.name:
        campaign.name = data.name
    if data.channel:
        campaign.channel = data.channel
    if data.status:
        campaign.status = data.status
    if data.start_date is not None:
        campaign.start_date = data.start_date
    if data.end_date is not None:
        campaign.end_date = data.end_date
        
    campaign.updated_at = datetime.now(timezone.utc)
    await session.flush()
    
    if old_status != "active" and campaign.status == "active":
        await publish_event("CAMPAIGN_LAUNCHED", tenant_id, campaign.id, {"name": campaign.name})
        
    return campaign

# ── Campaign Targets ──

async def add_target(
    session: AsyncSession, tenant_id: uuid.UUID, campaign_id: uuid.UUID, data: CampaignTargetCreate
) -> CampaignTarget:
    target = CampaignTarget(
        tenant_id=tenant_id,
        campaign_id=campaign_id,
        patient_id=data.patient_id,
        status="pending",
    )
    session.add(target)
    await session.flush()
    return target

async def get_targets(
    session: AsyncSession, tenant_id: uuid.UUID, campaign_id: uuid.UUID
) -> List[CampaignTarget]:
    result = await session.execute(
        select(CampaignTarget).where(and_(CampaignTarget.tenant_id == tenant_id, CampaignTarget.campaign_id == campaign_id, CampaignTarget.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

# ── Segments ──

async def create_segment(
    session: AsyncSession, tenant_id: uuid.UUID, data: SegmentCreate
) -> Segment:
    segment = Segment(
        tenant_id=tenant_id,
        name=data.name,
        definition=data.definition,
    )
    session.add(segment)
    await session.flush()
    return segment

async def get_segment(
    session: AsyncSession, tenant_id: uuid.UUID, segment_id: uuid.UUID
) -> Optional[Segment]:
    result = await session.execute(
        select(Segment).where(and_(Segment.id == segment_id, Segment.tenant_id == tenant_id, Segment.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Engagement Events ──

async def create_engagement_event(
    session: AsyncSession, tenant_id: uuid.UUID, data: EngagementEventCreate
) -> EngagementEvent:
    event = EngagementEvent(
        tenant_id=tenant_id,
        campaign_id=data.campaign_id,
        patient_id=data.patient_id,
        event_type=data.event_type,
        event_metadata=data.event_metadata,
    )
    session.add(event)
    await session.flush()
    
    evt_type = "CONVERSION_RECORDED" if data.event_type == "conversion" else "ENGAGEMENT_RECORDED"
    await publish_event(evt_type, tenant_id, event.id, {
        "campaign_id": str(event.campaign_id) if event.campaign_id else None,
        "patient_id": str(event.patient_id),
        "event_type": event.event_type
    })
    
    return event

async def get_engagement_events(
    session: AsyncSession, tenant_id: uuid.UUID, campaign_id: Optional[uuid.UUID] = None
) -> List[EngagementEvent]:
    stmt = select(EngagementEvent).where(EngagementEvent.tenant_id == tenant_id).order_by(EngagementEvent.created_at.desc())
    if campaign_id:
        stmt = stmt.where(EngagementEvent.campaign_id == campaign_id)
    result = await session.execute(stmt)
    return list(result.scalars().all())

# ── Funnels ──

async def create_funnel(
    session: AsyncSession, tenant_id: uuid.UUID, data: FunnelCreate
) -> Funnel:
    funnel = Funnel(
        tenant_id=tenant_id,
        name=data.name,
        stages=data.stages,
    )
    session.add(funnel)
    await session.flush()
    return funnel

async def get_funnel(
    session: AsyncSession, tenant_id: uuid.UUID, funnel_id: uuid.UUID
) -> Optional[Funnel]:
    result = await session.execute(
        select(Funnel).where(and_(Funnel.id == funnel_id, Funnel.tenant_id == tenant_id, Funnel.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()
