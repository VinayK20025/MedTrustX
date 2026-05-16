"""
MedTrustX Redis Cache Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.redis_cache import (
    CacheGetResponse, CacheSetRequest,
    RateLimitCheckRequest, RateLimitCheckResponse
)
from src.services import cache_service

router = APIRouter(tags=["Redis Cache Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Caching ──

@router.post("/cache/set", response_model=CacheGetResponse, status_code=status.HTTP_201_CREATED)
async def set_cache_entry(data: CacheSetRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    entry = await cache_service.set_cache_entry(session, tid, data)
    await session.commit()
    return entry


@router.get("/cache/{key}", response_model=CacheGetResponse)
async def get_cache_entry(key: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    entry = await cache_service.get_cache_entry(session, tid, key)
    if not entry.exists:
        raise HTTPException(status_code=404, detail="Cache key not found or expired")
    return entry


@router.delete("/cache/{key}")
async def delete_cache_entry(key: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    result = await cache_service.delete_cache_entry(session, tid, key)
    await session.commit()
    return result


# ── Rate Limiting ──

@router.post("/rate-limit/check", response_model=RateLimitCheckResponse)
async def check_rate_limit(data: RateLimitCheckRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    result = await cache_service.check_rate_limit(session, tid, data)
    await session.commit()
    if not result.allowed:
        raise HTTPException(status_code=429, detail="Too Many Requests")
    return result
