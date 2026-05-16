from fastapi import APIRouter, Query
from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime

from app.services.violation_monitor import ViolationMonitor
from app.db.sessions import get_raw_session
from app.db.repositories.violation_repo import ViolationRepository

router = APIRouter(prefix="/api/rls/violations", tags=["violations"])

@router.get("")
async def list_violations(
    tenant_id: Optional[UUID] = None,
    severity: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    action_taken: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100)
):
    session = await get_raw_session("clinical")
    try:
        repo = ViolationRepository(session)
        offset = (page - 1) * page_size
        results = await repo.get_violations(
            tenant_id=tenant_id,
            severity=severity,
            start_date=start_date,
            end_date=end_date,
            action_taken=action_taken,
            limit=page_size,
            offset=offset
        )
        return results
    finally:
        await session.close()

@router.get("/stats")
async def get_violation_stats():
    monitor = ViolationMonitor()
    stats = await monitor.get_stats()
    return stats
