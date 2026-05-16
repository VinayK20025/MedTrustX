"""
MedTrustX Security Incident Response Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.incident import ActionCreate, ActionResponse, IncidentCreate, IncidentResponse, LogResponse, ResponderResponse
from src.services import incident_service

router = APIRouter(tags=["Security Incident Response Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(data: IncidentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    inc = await incident_service.create_incident(session, tid, data)
    await session.commit()
    return inc

@router.get("/incidents/{id}", response_model=IncidentResponse)
async def get_incident(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    inc = await incident_service.get_incident(session, tid, id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.post("/incidents/{id}/actions", response_model=ActionResponse, status_code=status.HTTP_201_CREATED)
async def add_action(id: uuid.UUID, data: ActionCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    act = await incident_service.add_action(session, tid, id, data)
    if not act:
        raise HTTPException(status_code=404, detail="Incident not found")
    await session.commit()
    return act

@router.get("/incidents/{id}/logs", response_model=List[LogResponse])
async def list_incident_logs(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await incident_service.list_logs(session, tid, id)

@router.get("/responders", response_model=List[ResponderResponse])
async def list_responders(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await incident_service.list_responders(session, tid)
