"""
MedTrustX Notification Orchestrator Service — Workflows Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.orchestrator import WorkflowCreate, WorkflowResponse, WorkflowUpdate
from src.services import orchestrator_service

router = APIRouter(prefix="/notification-workflows", tags=["Workflows"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=WorkflowResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new workflow",
)
async def create_workflow(
    data: WorkflowCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    workflow = await orchestrator_service.create_workflow(session, tenant_id, data)
    await session.commit()
    return workflow

@router.get(
    "/{workflow_id}",
    response_model=WorkflowResponse,
    summary="Get workflow details",
)
async def get_workflow(
    workflow_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    workflow = await orchestrator_service.get_workflow(session, tenant_id, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put(
    "/{workflow_id}",
    response_model=WorkflowResponse,
    summary="Update a workflow",
)
async def update_workflow(
    workflow_id: uuid.UUID,
    data: WorkflowUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    workflow = await orchestrator_service.update_workflow(session, tenant_id, workflow_id, data)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    await session.commit()
    return workflow
