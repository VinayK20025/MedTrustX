"""
MedTrustX Asset Tracking RTLS Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.rtls import Asset, Location, MovementEvent, Tag
from src.schemas.rtls import AssetCreate, TagCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Assets ──

async def create_asset(session: AsyncSession, tenant_id: uuid.UUID, data: AssetCreate) -> Asset:
    ast = Asset(tenant_id=tenant_id, name=data.name, type=data.type)
    session.add(ast)
    await session.flush()
    return ast


# ── Tags ──

async def create_tag(session: AsyncSession, tenant_id: uuid.UUID, data: TagCreate) -> Tag:
    tg = Tag(tenant_id=tenant_id, asset_id=data.asset_id, tag_type=data.tag_type, identifier=data.identifier)
    session.add(tg)
    await session.flush()
    return tg


# ── Location & Movement ──

async def get_latest_location(session: AsyncSession, tenant_id: uuid.UUID, asset_id: uuid.UUID) -> Location | None:
    result = await session.execute(
        select(Location).where(
            and_(Location.asset_id == asset_id, Location.tenant_id == tenant_id, Location.deleted_at.is_(None))
        ).order_by(Location.timestamp.desc())
    )
    return result.scalars().first()


async def list_movements(session: AsyncSession, tenant_id: uuid.UUID) -> List[MovementEvent]:
    result = await session.execute(
        select(MovementEvent).where(
            and_(MovementEvent.tenant_id == tenant_id, MovementEvent.deleted_at.is_(None))
        ).order_by(MovementEvent.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())


async def list_zones(session: AsyncSession, tenant_id: uuid.UUID) -> List[str]:
    result = await session.execute(
        select(Location.zone).where(
            and_(Location.tenant_id == tenant_id, Location.deleted_at.is_(None))
        ).distinct()
    )
    return [row[0] for row in result.all()]
