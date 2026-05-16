"""
MedTrustX Notification Orchestrator Service — Instances Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.orchestrator import (
    InstanceCreate, InstanceDetail, WorkflowStepResponse, WorkflowEventCreate, WorkflowEventResponse
)
from src.services import orchestrator_service

router = APIRouter(prefix="/workflow-instances", tags=["Workflow Instances"])

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
    response_model=InstanceDetail,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new workflow instance",
)
async def create_instance(
    data: InstanceCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    instance = await orchestrator_service.create_instance(session, tenant_id, data)
    await session.commit()
    return await orchestrator_service.get_instance(session, tenant_id, instance.id)

@router.get(
    "/{instance_id}",
    response_model=InstanceDetail,
    summary="Get workflow instance details",
)
async def get_instance(
    instance_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    instance = await orchestrator_service.get_instance(session, tenant_id, instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    return instance

@router.get(
    "/{instance_id}/steps",
    response_model=List[WorkflowStepResponse],
    summary="Get steps for a workflow instance",
)
async def get_instance_steps(
    instance_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await orchestrator_service.get_instance_steps(session, tenant_id, instance_id)

@router.post(
    "/{instance_id}/events",
    response_model=WorkflowEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add an event to a workflow instance",
)
async def add_workflow_event(
    instance_id: uuid.UUID,
    data: WorkflowEventCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    if data.instance_id != instance_id:
        raise HTTPException(status_code=400, detail="Path ID and body ID mismatch")
    
    event = await orchestrator_service.add_workflow_event(session, tenant_id, data)
    await session.commit()
    return event
