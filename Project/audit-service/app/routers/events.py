"""
Audit Events Router.
"""
from fastapi import APIRouter, Depends, Query, Request, HTTPException
from typing import List, Optional
from datetime import datetime

from app.db.session import get_clinical_session
from app.dependencies import get_redis
from app.services.event_writer import AuditEventWriter
from app.models.audit_event import AuditEventCreate, AuditEventRecord

from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from sqlalchemy import text

router = APIRouter(prefix="/api/audit/events", tags=["events"])

@router.post("", response_model=AuditEventRecord)
async def create_event(
    event: AuditEventCreate,
    session: AsyncSession = Depends(get_clinical_session),
    redis: Redis = Depends(get_redis)
):
    writer = AuditEventWriter(session, redis)
    record = await writer.write(event.model_dump())
    return AuditEventRecord(**record)

@router.get("", response_model=List[AuditEventRecord])
async def list_events(
    request: Request,
    tenant_id: Optional[str] = None,
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_clinical_session)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")

    query = "SELECT * FROM audit_log WHERE 1=1"
    params = {}
    
    if tenant_id:
        query += " AND tenant_id = :tenant_id"
        params["tenant_id"] = tenant_id
    if user_id:
        query += " AND user_id = :user_id"
        params["user_id"] = user_id
    if action:
        query += " AND action = :action"
        params["action"] = action
    if resource_type:
        query += " AND resource_type = :resource_type"
        params["resource_type"] = resource_type
        
    query += " ORDER BY chain_sequence DESC LIMIT :limit OFFSET :offset"
    params["limit"] = page_size
    params["offset"] = (page - 1) * page_size
    
    result = await session.execute(text(query), params)
    return [AuditEventRecord(**row) for row in result.mappings().all()]

@router.get("/{event_id}", response_model=AuditEventRecord)
async def get_event(event_id: str, session: AsyncSession = Depends(get_clinical_session)):
    stmt = text("SELECT * FROM audit_log WHERE id = :id")
    result = await session.execute(stmt, {"id": event_id})
    row = result.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Event not found")
    return AuditEventRecord(**row)
