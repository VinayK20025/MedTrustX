"""
MedTrustX Care Coordination Service — Workflows Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.coordination import CareWorkflowCreate, CareWorkflowResponse
from src.services import coordination_service

router = APIRouter(prefix="/care-workflows", tags=["Workflows"])

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
    response_model=CareWorkflowResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Define a new reusable clinical care workflow template",
)
async def create_workflow(
    data: CareWorkflowCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    workflow = await coordination_service.create_workflow(session, tenant_id, data)
    await session.commit()
    return workflow

@router.get(
    "/{workflow_id}",
    response_model=CareWorkflowResponse,
    summary="Fetch a specific workflow template",
)
async def get_workflow(
    workflow_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    workflow = await coordination_service.get_workflow(session, tenant_id, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow template not found")
    return workflow
