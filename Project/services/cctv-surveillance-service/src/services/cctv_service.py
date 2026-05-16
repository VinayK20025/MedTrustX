"""
MedTrustX CCTV & Surveillance Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.cctv import Camera, Recording, SurveillanceEvent, VideoStream
from src.schemas.cctv import CameraCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Cameras ──

async def create_camera(session: AsyncSession, tenant_id: uuid.UUID, data: CameraCreate) -> Camera:
    c = Camera(tenant_id=tenant_id, name=data.name, location=data.location)
    session.add(c)
    await session.flush()
    
    # Auto-generate a mock stream for the newly registered camera
    stream = VideoStream(
        tenant_id=tenant_id,
        camera_id=c.id,
        stream_url=f"rtsps://stream.medtrust.local/{c.id}/live.m3u8"
    )
    session.add(stream)
    await session.flush()
    
    await publish_event("CAMERA_ONLINE", tenant_id, c.id, {"location": c.location})
    await publish_event("VIDEO_STREAM_STARTED", tenant_id, stream.id, {"camera_id": str(c.id)})
    
    return c


async def get_camera(session: AsyncSession, tenant_id: uuid.UUID, camera_id: uuid.UUID) -> Camera | None:
    result = await session.execute(
        select(Camera).where(and_(Camera.id == camera_id, Camera.tenant_id == tenant_id, Camera.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Streams & Media ──

async def get_stream_by_camera(session: AsyncSession, tenant_id: uuid.UUID, camera_id: uuid.UUID) -> VideoStream | None:
    result = await session.execute(
        select(VideoStream).where(
            and_(VideoStream.camera_id == camera_id, VideoStream.tenant_id == tenant_id, VideoStream.deleted_at.is_(None))
        ).order_by(VideoStream.created_at.desc())
    )
    return result.scalars().first()


async def list_recordings(session: AsyncSession, tenant_id: uuid.UUID) -> List[Recording]:
    result = await session.execute(
        select(Recording).where(
            and_(Recording.tenant_id == tenant_id, Recording.deleted_at.is_(None))
        ).order_by(Recording.start_time.desc()).limit(100)
    )
    return list(result.scalars().all())


async def list_events(session: AsyncSession, tenant_id: uuid.UUID) -> List[SurveillanceEvent]:
    result = await session.execute(
        select(SurveillanceEvent).where(
            and_(SurveillanceEvent.tenant_id == tenant_id, SurveillanceEvent.deleted_at.is_(None))
        ).order_by(SurveillanceEvent.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
