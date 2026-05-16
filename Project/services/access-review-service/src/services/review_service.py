"""
MedTrustX Access Review Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.review import ReviewCampaign, ReviewItem, Certification, AccessAnomaly, Revocation
from src.schemas.review import (
    CampaignCreate, CertificationCreate, RevocationCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Campaigns ──

async def create_campaign(
    session: AsyncSession, tenant_id: uuid.UUID, data: CampaignCreate
) -> ReviewCampaign:
    campaign = ReviewCampaign(
        tenant_id=tenant_id,
        name=data.name,
        scope=data.scope,
        status="active"
    )
    session.add(campaign)
    await session.flush()
    # In a real scenario, this would trigger generating ReviewItems
    return campaign

async def get_campaign(
    session: AsyncSession, tenant_id: uuid.UUID, campaign_id: uuid.UUID
) -> Optional[ReviewCampaign]:
    result = await session.execute(
        select(ReviewCampaign).where(and_(ReviewCampaign.id == campaign_id, ReviewCampaign.tenant_id == tenant_id, ReviewCampaign.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def get_campaign_items(
    session: AsyncSession, tenant_id: uuid.UUID, campaign_id: uuid.UUID
) -> List[ReviewItem]:
    result = await session.execute(
        select(ReviewItem).where(and_(ReviewItem.campaign_id == campaign_id, ReviewItem.tenant_id == tenant_id, ReviewItem.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

# ── Certifications ──

async def certify_access(
    session: AsyncSession, tenant_id: uuid.UUID, data: CertificationCreate
) -> Optional[Certification]:
    # Verify item exists
    result = await session.execute(
        select(ReviewItem).where(and_(ReviewItem.id == data.review_item_id, ReviewItem.tenant_id == tenant_id, ReviewItem.deleted_at.is_(None)))
    )
    item = result.scalar_one_or_none()
    if not item:
        return None
        
    cert = Certification(
        tenant_id=tenant_id,
        review_item_id=data.review_item_id,
        reviewer_id=data.reviewer_id,
        decision=data.decision,
        comments=data.comments
    )
    session.add(cert)
    
    item.status = "reviewed"
    item.reviewed_at = datetime.now(timezone.utc)
    
    await session.flush()
    
    if data.decision == "certified":
        await publish_event("ACCESS_CERTIFIED", tenant_id, cert.id, {"user_id": str(item.user_id), "role_id": str(item.role_id)})
    elif data.decision == "revoke":
        # Create revocation record
        rev = Revocation(
            tenant_id=tenant_id,
            user_id=item.user_id,
            role_id=item.role_id,
            reason=data.comments or "Review certification rejected"
        )
        session.add(rev)
        await session.flush()
        await publish_event("ACCESS_REVOKED", tenant_id, rev.id, {"user_id": str(item.user_id), "role_id": str(item.role_id), "reason": rev.reason})
        
    return cert

# ── Anomalies ──

async def get_anomalies(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[AccessAnomaly]:
    result = await session.execute(
        select(AccessAnomaly).where(and_(AccessAnomaly.tenant_id == tenant_id, AccessAnomaly.deleted_at.is_(None))).order_by(AccessAnomaly.detected_at.desc())
    )
    return list(result.scalars().all())

# ── Revocations ──

async def create_revocation(
    session: AsyncSession, tenant_id: uuid.UUID, data: RevocationCreate
) -> Revocation:
    rev = Revocation(
        tenant_id=tenant_id,
        user_id=data.user_id,
        role_id=data.role_id,
        reason=data.reason
    )
    session.add(rev)
    await session.flush()
    await publish_event("ACCESS_REVOKED", tenant_id, rev.id, {"user_id": str(data.user_id), "role_id": str(data.role_id), "reason": data.reason})
    return rev
