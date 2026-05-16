"""
Schedules Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from datetime import datetime

from app.db.session import get_db_session
from app.dependencies import get_redis
from app.services.waitlist_manager import WaitlistManager
from app.db.repositories.schedule_repo import ScheduleRepository

router = APIRouter(prefix="/api/schedules", tags=["schedules"])

@router.get("/availability/{provider_id}")
async def get_availability(
    provider_id: str,
    date_start: datetime,
    date_end: datetime,
    request: Request,
    session: AsyncSession = Depends(get_db_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    repo = ScheduleRepository(session)
    
    slots = await repo.get_provider_availability(tenant_id, provider_id, date_start, date_end)
    return slots

@router.post("/waitlist")
async def add_to_waitlist(
    request: Request,
    payload: Dict[str, Any],
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    manager = WaitlistManager(redis)
    
    entry_id = await manager.add_to_waitlist(tenant_id, payload)
    return {"status": "added", "waitlist_id": entry_id}
