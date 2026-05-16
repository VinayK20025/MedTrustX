"""
Breach Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from redis.asyncio import Redis
from typing import List, Optional
from uuid import UUID

from app.db.session import get_clinical_session
from app.dependencies import get_redis
from app.models.breach import BreachIncidentResponse, BreachNotificationRequest
from app.services.breach_notifier import BreachNotifier

router = APIRouter(prefix="/api/audit/breach", tags=["breach"])

@router.get("/incidents", response_model=List[BreachIncidentResponse])
async def list_incidents(
    request: Request,
    tenant_id: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    session: AsyncSession = Depends(get_clinical_session)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles and "dpo" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")

    query = "SELECT * FROM breach_incidents WHERE 1=1"
    params = {}
    
    if tenant_id:
        query += " AND tenant_id = :tenant_id"
        params["tenant_id"] = tenant_id
    if severity:
        query += " AND severity = :severity"
        params["severity"] = severity
    if status:
        query += " AND status = :status"
        params["status"] = status
        
    query += " ORDER BY detected_at DESC"
    
    result = await session.execute(text(query), params)
    return [BreachIncidentResponse(**row) for row in result.mappings().all()]

@router.post("/{incident_id}/notify")
async def notify_breach(
    incident_id: UUID,
    payload: BreachNotificationRequest,
    request: Request,
    session: AsyncSession = Depends(get_clinical_session),
    redis: Redis = Depends(get_redis)
):
    roles = getattr(request.state, "roles", [])
    if "dpo" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    notifier = BreachNotifier(session, redis)
    await notifier.notify_manual(incident_id, payload.notified_by, payload.notification_type, payload.notes)
    
    return {"status": "notified"}
