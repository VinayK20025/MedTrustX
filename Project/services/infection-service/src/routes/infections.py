"""
MedTrustX Infection Control Service — Infection Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.infection import (
    InfectionCreate,
    InfectionEventCreate,
    InfectionEventResponse,
    InfectionResponse,
    InfectionUpdate,
)
from src.services import infection_service

router = APIRouter(prefix="/infections", tags=["Infections"])

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
    response_model=InfectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a new infection case",
)
async def record_infection(
    data: InfectionCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    infection = await infection_service.record_infection(session, tenant_id, data)
    await session.commit()
    return infection

@router.get(
    "/{infection_id}",
    response_model=InfectionResponse,
    summary="Get infection case details",
)
async def get_infection(
    infection_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    infection = await infection_service.get_infection(session, tenant_id, infection_id)
    if not infection:
        raise HTTPException(status_code=404, detail="Infection not found")
    return infection

@router.put(
    "/{infection_id}",
    response_model=InfectionResponse,
    summary="Update infection status",
)
async def update_infection(
    infection_id: uuid.UUID,
    data: InfectionUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    infection = await infection_service.update_infection_status(session, tenant_id, infection_id, data)
    if not infection:
        raise HTTPException(status_code=404, detail="Infection not found")
    await session.commit()
    return infection

@router.post(
    "/{infection_id}/events",
    response_model=InfectionEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log an event on the infection timeline",
)
async def log_event(
    infection_id: uuid.UUID,
    data: InfectionEventCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    event = await infection_service.add_infection_event(session, tenant_id, infection_id, data)
    if not event:
        raise HTTPException(status_code=404, detail="Infection not found")
    await session.commit()
    return event

@router.get(
    "/{infection_id}/events",
    response_model=List[InfectionEventResponse],
    summary="Get infection timeline",
)
async def list_events(
    infection_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await infection_service.get_infection_events(session, tenant_id, infection_id)
