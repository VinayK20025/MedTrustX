"""
MedTrustX Strategic Planning Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.planning import (
    ForecastResponse, InitiativeCreate, InitiativeResponse,
    ObjectiveCreate, ObjectiveResponse, PlanCreate, PlanResponse,
)
from src.services import planning_service

router = APIRouter(tags=["Strategic Planning Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(data: PlanCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    plan = await planning_service.create_plan(session, tid, data)
    await session.commit()
    return plan

@router.get("/plans/{id}", response_model=PlanResponse)
async def get_plan(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    plan = await planning_service.get_plan(session, tid, id)
    if not plan:
        raise HTTPException(status_code=404, detail="Strategic plan not found")
    return plan

@router.post("/objectives", response_model=ObjectiveResponse, status_code=status.HTTP_201_CREATED)
async def create_objective(data: ObjectiveCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    obj = await planning_service.create_objective(session, tid, data)
    await session.commit()
    return obj

@router.post("/initiatives", response_model=InitiativeResponse, status_code=status.HTTP_201_CREATED)
async def create_initiative(data: InitiativeCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    init = await planning_service.create_initiative(session, tid, data)
    await session.commit()
    return init

@router.get("/forecasts", response_model=List[ForecastResponse])
async def list_forecasts(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await planning_service.list_forecasts(session, tid)
