"""
MedTrustX Digital Twin Engine Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.twin import (
    SimulationRequest, SimulationResponse, StateSnapshotResponse,
    StateUpdateRequest, TwinCreate, TwinEventResponse, TwinResponse
)
from src.services import twin_service

router = APIRouter(tags=["Digital Twin Engine Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Twin Lifecycle ──

@router.post("/twins", response_model=TwinResponse, status_code=status.HTTP_201_CREATED)
async def create_twin(data: TwinCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    twin = await twin_service.create_twin(session, tid, data)
    await session.commit()
    return twin


@router.get("/twins/{id}", response_model=TwinResponse)
async def get_twin(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    twin = await twin_service.get_twin(session, tid, id)
    if not twin:
        raise HTTPException(status_code=404, detail="Digital twin not found")
    return twin


# ── State Synchronization ──

@router.post("/twins/{id}/state", response_model=StateSnapshotResponse, status_code=status.HTTP_201_CREATED)
async def update_state(id: uuid.UUID, data: StateUpdateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    snapshot = await twin_service.update_state(session, tid, id, data)
    await session.commit()
    return snapshot


# ── Simulations ──

@router.post("/twins/{id}/simulate", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def run_simulation(id: uuid.UUID, data: SimulationRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sim = await twin_service.run_simulation(session, tid, id, data)
    await session.commit()
    return sim


# ── Events ──

@router.get("/twins/{id}/events", response_model=List[TwinEventResponse])
async def get_twin_events(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await twin_service.get_twin_events(session, tid, id)
