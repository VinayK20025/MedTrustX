"""
MedTrustX Redis Cache Service — Business Logic Layer

Abstraction layer over Redis backing and PostgreSQL metadata fallback.
"""
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.redis_cache import CacheKey, RateLimit
from src.schemas.redis_cache import (
    CacheGetResponse,
    CacheSetRequest,
    RateLimitCheckRequest,
    RateLimitCheckResponse,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Caching ──

async def set_cache_entry(
    session: AsyncSession, tenant_id: uuid.UUID, data: CacheSetRequest
) -> CacheGetResponse:
    # First check if exists
    result = await session.execute(
        select(CacheKey).where(and_(CacheKey.cache_key == data.key, CacheKey.tenant_id == tenant_id))
    )
    cache_entry = result.scalar_one_or_none()

    expires = None
    if data.ttl_seconds:
        expires = datetime.now(timezone.utc) + timedelta(seconds=data.ttl_seconds)

    if cache_entry:
        cache_entry.value = data.value
        cache_entry.expires_at = expires
        cache_entry.deleted_at = None
    else:
        cache_entry = CacheKey(
            tenant_id=tenant_id,
            cache_key=data.key,
            value=data.value,
            expires_at=expires,
        )
        session.add(cache_entry)

    await session.flush()
    await publish_event("CACHE_UPDATED", tenant_id, cache_entry.id, {"key": data.key})
    return CacheGetResponse(key=data.key, value=data.value, exists=True)


async def get_cache_entry(
    session: AsyncSession, tenant_id: uuid.UUID, key: str
) -> CacheGetResponse:
    result = await session.execute(
        select(CacheKey).where(and_(CacheKey.cache_key == key, CacheKey.tenant_id == tenant_id, CacheKey.deleted_at.is_(None)))
    )
    cache_entry = result.scalar_one_or_none()

    if cache_entry:
        if cache_entry.expires_at and cache_entry.expires_at < datetime.now(timezone.utc):
            cache_entry.soft_delete()
            await session.flush()
            return CacheGetResponse(key=key, exists=False)
        return CacheGetResponse(key=key, value=cache_entry.value, exists=True)
    return CacheGetResponse(key=key, exists=False)


async def delete_cache_entry(
    session: AsyncSession, tenant_id: uuid.UUID, key: str
) -> dict:
    result = await session.execute(
        select(CacheKey).where(and_(CacheKey.cache_key == key, CacheKey.tenant_id == tenant_id, CacheKey.deleted_at.is_(None)))
    )
    cache_entry = result.scalar_one_or_none()
    if cache_entry:
        cache_entry.soft_delete()
        await session.flush()
        await publish_event("CACHE_INVALIDATED", tenant_id, cache_entry.id, {"key": key})
    return {"status": "deleted"}


# ── Rate Limiting ──

async def check_rate_limit(
    session: AsyncSession, tenant_id: uuid.UUID, data: RateLimitCheckRequest
) -> RateLimitCheckResponse:
    now = datetime.now(timezone.utc)
    result = await session.execute(
        select(RateLimit).where(and_(RateLimit.key == data.key, RateLimit.tenant_id == tenant_id, RateLimit.deleted_at.is_(None)))
    )
    limit_entry = result.scalar_one_or_none()

    if limit_entry:
        window_end = limit_entry.window_start + timedelta(seconds=data.window_seconds)
        if now > window_end:
            limit_entry.window_start = now
            limit_entry.request_count = 1
        else:
            limit_entry.request_count += 1
    else:
        limit_entry = RateLimit(
            tenant_id=tenant_id,
            key=data.key,
            request_count=1,
            window_start=now,
        )
        session.add(limit_entry)

    await session.flush()

    allowed = limit_entry.request_count <= data.limit
    if not allowed:
        await publish_event("RATE_LIMIT_EXCEEDED", tenant_id, limit_entry.id, {"key": data.key})

    return RateLimitCheckResponse(key=data.key, allowed=allowed, current_count=limit_entry.request_count)
