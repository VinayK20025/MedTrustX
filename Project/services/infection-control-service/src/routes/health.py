"""Health check endpoints."""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Liveness probe."""
    return {
        "status": "healthy",
        "service": "infection-control-service",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/ready")
async def readiness_check():
    """Readiness probe — checks DB and Redis connectivity."""
    checks = {
        "database": "ok",  # TODO: Actual DB ping
        "redis": "ok",     # TODO: Actual Redis ping
        "kafka": "ok",     # TODO: Actual Kafka ping
    }
    all_ok = all(v == "ok" for v in checks.values())
    return {
        "status": "ready" if all_ok else "degraded",
        "checks": checks,
        "service": "infection-control-service",
    }

