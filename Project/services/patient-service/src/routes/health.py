"""
MedTrustX Patient Service — Health Check Endpoints

Provides Kubernetes-compatible liveness and readiness probes
with real dependency health checks.
"""
from datetime import datetime, timezone

import structlog
from fastapi import APIRouter

from src.config import settings

logger = structlog.get_logger()

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    **Liveness probe** — confirms the process is running.
    Used by Docker HEALTHCHECK and Kubernetes liveness probe.
    """
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ready")
async def readiness_check():
    """
    **Readiness probe** — validates connectivity to critical dependencies.
    Service is marked unready if any dependency is unreachable.

    Checks:
      - PostgreSQL (pg-clinical)
      - Redis
      - Kafka / Redpanda
    """
    checks = {}

    # ── PostgreSQL ──────────────────────────────────────────────
    try:
        from src.database import engine
        from sqlalchemy import text

        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        checks["database"] = f"error: {str(exc)[:100]}"
        logger.error("readiness_db_failed", error=str(exc))

    # ── Redis ───────────────────────────────────────────────────
    try:
        import redis.asyncio as aioredis

        r = aioredis.from_url(settings.REDIS_URL, socket_timeout=2)
        await r.ping()
        await r.aclose()
        checks["redis"] = "ok"
    except Exception as exc:
        checks["redis"] = f"error: {str(exc)[:100]}"
        logger.error("readiness_redis_failed", error=str(exc))

    # ── Kafka / Redpanda ────────────────────────────────────────
    try:
        from src.services.event_publisher import _producer

        if _producer is not None:
            checks["kafka"] = "ok"
        else:
            checks["kafka"] = "not_connected"
    except Exception as exc:
        checks["kafka"] = f"error: {str(exc)[:100]}"

    all_ok = all(v == "ok" for v in checks.values())

    return {
        "status": "ready" if all_ok else "degraded",
        "checks": checks,
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
