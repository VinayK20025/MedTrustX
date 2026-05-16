"""
MedTrustX DB Integration — Read Cache Layer (§6)

Read vs Write DB Strategy:
  WRITE DB (PostgreSQL) → transactional, strict consistency
  READ DB  (Redis)      → fast reads, cached projections

This module provides:
- Transparent Redis caching for read-heavy queries
- TTL-based invalidation
- Tenant-scoped cache keys (prevents cross-tenant leakage)
- Cache-aside pattern implementation
"""
import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Callable, Optional, TypeVar
from uuid import UUID

import structlog

logger = structlog.get_logger()
T = TypeVar("T")


class _CacheEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


class ReadCache:
    """
    §6 — Tenant-isolated Redis read cache.

    Usage:
        cache = ReadCache(redis_client)

        # Cache a query result
        await cache.set("patients", tenant_id, patient_id, patient_data, ttl=300)

        # Read from cache
        data = await cache.get("patients", tenant_id, patient_id)

        # Invalidate on write
        await cache.invalidate("patients", tenant_id, patient_id)
    """

    def __init__(self, redis_client, key_prefix: str = "medtrust"):
        self._redis = redis_client
        self._prefix = key_prefix

    def _build_key(self, domain: str, tenant_id: str, *parts) -> str:
        """
        Tenant-scoped cache key.
        Format: medtrust:{domain}:{tenant_id}:{parts_hash}
        Prevents any cross-tenant cache poisoning.
        """
        suffix = ":".join(str(p) for p in parts)
        key_hash = hashlib.sha256(suffix.encode()).hexdigest()[:16]
        return f"{self._prefix}:{domain}:{tenant_id}:{key_hash}"

    async def get(self, domain: str, tenant_id: str, *parts) -> Optional[Any]:
        key = self._build_key(domain, tenant_id, *parts)
        try:
            raw = await self._redis.get(key)
            if raw is None:
                return None
            return json.loads(raw)
        except Exception as exc:
            logger.warning("cache_get_failed", key=key, error=str(exc)[:100])
            return None

    async def set(self, domain: str, tenant_id: str, *parts, value: Any, ttl: int = 300):
        key = self._build_key(domain, tenant_id, *parts)
        try:
            serialized = json.dumps(value, cls=_CacheEncoder)
            await self._redis.setex(key, ttl, serialized)
        except Exception as exc:
            logger.warning("cache_set_failed", key=key, error=str(exc)[:100])

    async def invalidate(self, domain: str, tenant_id: str, *parts):
        key = self._build_key(domain, tenant_id, *parts)
        try:
            await self._redis.delete(key)
        except Exception as exc:
            logger.warning("cache_invalidate_failed", key=key, error=str(exc)[:100])

    async def invalidate_domain(self, domain: str, tenant_id: str):
        """Flush all cached entries for a domain+tenant (e.g., after bulk write)."""
        pattern = f"{self._prefix}:{domain}:{tenant_id}:*"
        try:
            cursor = 0
            while True:
                cursor, keys = await self._redis.scan(cursor, match=pattern, count=100)
                if keys:
                    await self._redis.delete(*keys)
                if cursor == 0:
                    break
        except Exception as exc:
            logger.warning("cache_domain_invalidate_failed", pattern=pattern, error=str(exc)[:100])


def cached_query(cache: ReadCache, domain: str, ttl: int = 300):
    """
    Decorator implementing cache-aside pattern.

    Usage:
        @cached_query(cache, "patients", ttl=60)
        async def get_patient(session, tenant_id, patient_id):
            ...
    """
    def decorator(func: Callable) -> Callable:
        async def wrapper(*args, **kwargs):
            tenant_id = kwargs.get("tenant_id") or (args[1] if len(args) > 1 else None)
            cache_parts = [str(a) for a in args[2:]] + [f"{k}={v}" for k, v in sorted(kwargs.items()) if k != "session" and k != "tenant_id"]

            if tenant_id:
                cached = await cache.get(domain, str(tenant_id), *cache_parts)
                if cached is not None:
                    return cached

            result = await func(*args, **kwargs)

            if tenant_id and result is not None:
                await cache.set(domain, str(tenant_id), *cache_parts, value=result, ttl=ttl)

            return result
        return wrapper
    return decorator
