"""
MedTrustX Care Coordination Service — Tasks Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.coordination import CareTaskCreate, CareTaskResponse, CareTaskUpdate
from src.services import coordination_service

router = APIRouter(tags=["Care Tasks"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/care-plans/{plan_id}/tasks",
    response_model=CareTaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new task to a care plan",
)
async def add_task(
    plan_id: uuid.UUID,
    data: CareTaskCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    task = await coordination_service.add_task(session, tenant_id, plan_id, data)
    if not task:
        raise HTTPException(status_code=404, detail="Care plan not found")
    await session.commit()
    return task

@router.get(
    "/care-plans/{plan_id}/tasks",
    response_model=List[CareTaskResponse],
    summary="List all tasks within a specific care plan",
)
async def get_plan_tasks(
    plan_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await coordination_service.get_plan_tasks(session, tenant_id, plan_id)

@router.put(
    "/care-tasks/{task_id}",
    response_model=CareTaskResponse,
    summary="Update task status or assignment",
)
async def update_task(
    task_id: uuid.UUID,
    data: CareTaskUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    task = await coordination_service.update_task(session, tenant_id, task_id, data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await session.commit()
    return task
