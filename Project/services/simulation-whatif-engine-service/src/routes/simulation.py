"""
MedTrustX Simulation & What-If Engine Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.simulation import (
    ScenarioCreate, ScenarioResponse, SimulationCreate,
    SimulationEventResponse, SimulationResponse, SimulationResultResponse
)
from src.services import simulation_service

router = APIRouter(tags=["Simulation & What-If Engine Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Simulations ──

@router.post("/simulations", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_simulation(data: SimulationCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sim = await simulation_service.create_simulation(session, tid, data)
    await session.commit()
    return sim


@router.post("/simulations/{id}/run", response_model=SimulationResultResponse, status_code=status.HTTP_201_CREATED)
async def run_simulation(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    result = await simulation_service.run_simulation(session, tid, id)
    await session.commit()
    return result


# ── Scenarios ──

@router.post("/simulations/{id}/scenarios", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
async def add_scenario(id: uuid.UUID, data: ScenarioCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    scenario = await simulation_service.add_scenario(session, tid, id, data)
    await session.commit()
    return scenario


# ── Results ──

@router.get("/simulations/{id}/results", response_model=List[SimulationResultResponse])
async def get_results(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await simulation_service.get_results(session, tid, id)


# ── Events ──

@router.get("/simulations/{id}/events", response_model=List[SimulationEventResponse])
async def get_events(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await simulation_service.get_events(session, tid, id)
