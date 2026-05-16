"""
MedTrustX Operational Command Center Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.command_center import (
    CommandCreate, CommandResponse, ControlSessionResponse,
    IncidentCreate, IncidentResponse, OperationalEventResponse
)
from src.services import command_center_service

router = APIRouter(tags=["Operational Command Center Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Incidents ──

@router.post("/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(data: IncidentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    incident = await command_center_service.create_incident(session, tid, data)
    await session.commit()
    return incident


@router.get("/incidents/{id}", response_model=IncidentResponse)
async def get_incident(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    incident = await command_center_service.get_incident(session, tid, id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


# ── Commands ──

@router.post("/commands", response_model=CommandResponse, status_code=status.HTTP_201_CREATED)
async def execute_command(data: CommandCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    cmd = await command_center_service.execute_command(session, tid, data)
    await session.commit()
    return cmd


# ── Events ──

@router.get("/events", response_model=List[OperationalEventResponse])
async def list_events(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await command_center_service.get_events(session, tid)


# ── Sessions ──

@router.get("/sessions", response_model=List[ControlSessionResponse])
async def list_sessions(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await command_center_service.get_sessions(session, tid)
