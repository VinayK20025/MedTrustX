"""
MedTrustX Nursing Service — Health Check Endpoints
"""
from datetime import datetime, timezone
import structlog
from fastapi import APIRouter

from src.config import settings

logger = structlog.get_logger()
router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@router.get("/ready")
async def readiness_check():
    checks = {}

    try:
        from src.database import engine
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        checks["database"] = f"error: {str(exc)[:100]}"
        logger.error("readiness_db_failed", error=str(exc))

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
