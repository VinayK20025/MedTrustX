"""
Reports Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis

from app.db.session import get_operational_session
from app.dependencies import get_redis
from app.services.report_generator import ReportGenerator
from app.models.report import ReportRequest, ReportResponse

router = APIRouter(prefix="/api/compliance/reports", tags=["reports"])

@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    request: Request,
    payload: ReportRequest,
    session: AsyncSession = Depends(get_operational_session),
    redis: Redis = Depends(get_redis)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    tenant_id = getattr(request.state, "tenant_id", "default")
    generator = ReportGenerator(session, redis)
    job_id = await generator.request_report(tenant_id, payload.report_type, payload.framework, payload.format)
    return ReportResponse(task_id=job_id, status="accepted")

@router.get("/{task_id}/status")
async def report_status(
    task_id: str,
    request: Request,
    session: AsyncSession = Depends(get_operational_session),
    redis: Redis = Depends(get_redis)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    generator = ReportGenerator(session, redis)
    status = await generator.get_report_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="Report task not found")
    return status
