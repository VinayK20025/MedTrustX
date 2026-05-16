"""
MedTrustX Nursing Service — Task Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.nursing import NursingTaskCreate, NursingTaskResponse, NursingTaskUpdate
from src.services import nursing_service

router = APIRouter(prefix="/nursing/tasks", tags=["Tasks"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    user_id_str = getattr(request.state, "user_id", None) or request.headers.get("X-User-ID")
    if not user_id_str:
        return uuid.uuid4()
    return uuid.UUID(str(user_id_str))

@router.post(
    "/",
    response_model=NursingTaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create nursing task",
)
async def create_task(
    data: NursingTaskCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    task = await nursing_service.create_task(session, tenant_id, data)
    await session.commit()
    return task

@router.get(
    "/{task_id}",
    response_model=NursingTaskResponse,
    summary="Get task details",
)
async def get_task(
    task_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    task = await nursing_service.get_task(session, tenant_id, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put(
    "/{task_id}",
    response_model=NursingTaskResponse,
    summary="Update task status or assignment",
)
async def update_task(
    task_id: uuid.UUID,
    data: NursingTaskUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    task = await nursing_service.update_task(session, tenant_id, task_id, user_id, data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await session.commit()
    return task

@router.post(
    "/{task_id}/complete",
    response_model=NursingTaskResponse,
    summary="Mark task as completed",
)
async def complete_task(
    task_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    data = NursingTaskUpdate(status="completed")
    task = await nursing_service.update_task(session, tenant_id, task_id, user_id, data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await session.commit()
    return task
