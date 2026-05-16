"""
MedTrustX Automation & RPA Engine Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.automation import RunResponse, TaskResponse, WorkflowCreate, WorkflowResponse
from src.services import automation_service

router = APIRouter(tags=["Automation & RPA Engine Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/workflows", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(data: WorkflowCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    wf = await automation_service.create_workflow(session, tid, data)
    await session.commit()
    return wf

@router.post("/workflows/{id}/run", response_model=RunResponse, status_code=status.HTTP_201_CREATED)
async def run_workflow(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    try:
        run = await automation_service.trigger_workflow(session, tid, id)
        await session.commit()
        return run
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/workflows/{id}", response_model=WorkflowResponse)
async def get_workflow(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    wf = await automation_service.get_workflow(session, tid, id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf

@router.get("/runs/{id}", response_model=RunResponse)
async def get_run(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    run = await automation_service.get_run(session, tid, id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await automation_service.list_tasks(session, tid)
