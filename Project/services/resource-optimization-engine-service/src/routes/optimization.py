"""
MedTrustX Resource Optimization Engine Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.optimization import (
    AllocationResponse, OptimizationRunResponse, OptimizeRequest,
    ResourceCreate, ResourceResponse
)
from src.services import optimization_service

router = APIRouter(tags=["Resource Optimization Engine Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Resources ──

@router.post("/resources", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(data: ResourceCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    resource = await optimization_service.create_resource(session, tid, data)
    await session.commit()
    return resource


@router.get("/resources/{id}", response_model=ResourceResponse)
async def get_resource(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    resource = await optimization_service.get_resource(session, tid, id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


# ── Optimization ──

@router.post("/optimize", response_model=OptimizationRunResponse, status_code=status.HTTP_201_CREATED)
async def run_optimization(data: OptimizeRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    run = await optimization_service.run_optimization(session, tid, data)
    await session.commit()
    return run


# ── Allocations ──

@router.get("/allocations", response_model=List[AllocationResponse])
async def list_allocations(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await optimization_service.get_allocations(session, tid)


# ── Results ──

@router.get("/optimization/{run_id}", response_model=OptimizationRunResponse)
async def get_optimization_run(run_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    run = await optimization_service.get_optimization_run(session, tid, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Optimization run not found")
    return run
