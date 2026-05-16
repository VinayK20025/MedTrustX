"""Health endpoints."""
from datetime import datetime, timezone
from fastapi import APIRouter
from src.config import settings
router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "healthy", "service": settings.SERVICE_NAME, "version": settings.SERVICE_VERSION, "timestamp": datetime.now(timezone.utc).isoformat()}

@router.get("/ready")
async def ready():
    return {"status": "ready", "service": settings.SERVICE_NAME, "timestamp": datetime.now(timezone.utc).isoformat()}
