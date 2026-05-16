"""
MedTrustX Workflow Engine — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.workflow import (
    TaskCreate, TaskResponse,
    TransitionCreate, TransitionResponse,
    WorkflowCreate, WorkflowResponse,
    WorkflowDefinitionCreate, WorkflowDefinitionResponse,
    WorkflowInstanceCreate, WorkflowInstanceResponse
)
from src.services import workflow_service

router = APIRouter(tags=["Workflow Engine"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Workflows ──

@router.post("/workflows", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(data: WorkflowCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    workflow = await workflow_service.create_workflow(session, tid, data)
    await session.commit()
    return workflow

@router.get("/workflows/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(workflow_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    workflow = await workflow_service.get_workflow(session, tid, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


# ── Definitions ──

@router.post("/workflow-definitions", response_model=WorkflowDefinitionResponse, status_code=status.HTTP_201_CREATED)
async def create_definition(data: WorkflowDefinitionCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    definition = await workflow_service.create_definition(session, tid, data)
    await session.commit()
    return definition


# ── Instances ──

@router.post("/workflow-instances", response_model=WorkflowInstanceResponse, status_code=status.HTTP_201_CREATED)
async def create_instance(data: WorkflowInstanceCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    instance = await workflow_service.create_instance(session, tid, data)
    await session.commit()
    return instance

@router.get("/workflow-instances/{instance_id}", response_model=WorkflowInstanceResponse)
async def get_instance(instance_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    instance = await workflow_service.get_instance(session, tid, instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    return instance


# ── Tasks ──

@router.post("/workflow-instances/{instance_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(instance_id: uuid.UUID, data: TaskCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    if data.instance_id != instance_id:
        data.instance_id = instance_id
    task = await workflow_service.create_task(session, tid, data)
    await session.commit()
    return task

@router.post("/tasks/{task_id}/complete", response_model=TaskResponse)
async def complete_task(task_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    task = await workflow_service.complete_task(session, tid, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await session.commit()
    return task


# ── Transitions ──

@router.post("/workflow-instances/{instance_id}/transitions", response_model=TransitionResponse, status_code=status.HTTP_201_CREATED)
async def transition_instance(instance_id: uuid.UUID, data: TransitionCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    if data.instance_id != instance_id:
        data.instance_id = instance_id
    transition = await workflow_service.transition_instance(session, tid, data)
    if not transition:
        raise HTTPException(status_code=404, detail="Instance not found")
    await session.commit()
    return transition
