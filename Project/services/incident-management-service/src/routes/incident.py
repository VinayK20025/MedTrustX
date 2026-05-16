"""
MedTrustX Incident Management Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.incident import (
    IncidentAssignmentCreate, IncidentAssignmentResponse,
    IncidentCreate, IncidentResponse,
    IncidentUpdateCreate, IncidentUpdateResponse,
    PlaybookCreate, PlaybookResponse,
    RootCauseAnalysisCreate, RootCauseAnalysisResponse
)
from src.services import incident_service

router = APIRouter(tags=["Incident Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    raw = request.headers.get("X-User-ID", "00000000-0000-0000-0000-000000000000")
    return uuid.UUID(raw)


# ── Incidents ──

@router.post("/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(data: IncidentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    incident = await incident_service.create_incident(session, tid, data)
    await session.commit()
    return incident

@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    incident = await incident_service.get_incident(session, tid, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


# ── Incident Assignments ──

@router.post("/incidents/{incident_id}/assign", response_model=IncidentAssignmentResponse)
async def assign_incident(incident_id: uuid.UUID, data: IncidentAssignmentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    assignment = await incident_service.assign_incident(session, tid, incident_id, data)
    await session.commit()
    return assignment


# ── Incident Updates ──

@router.post("/incidents/{incident_id}/update", response_model=IncidentUpdateResponse)
async def update_incident(incident_id: uuid.UUID, data: IncidentUpdateCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    uid = _get_user_id(request)
    update = await incident_service.update_incident(session, tid, incident_id, uid, data)
    await session.commit()
    return update


# ── Playbooks ──

@router.post("/playbooks", response_model=PlaybookResponse, status_code=status.HTTP_201_CREATED)
async def create_playbook(data: PlaybookCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    playbook = await incident_service.create_playbook(session, tid, data)
    await session.commit()
    return playbook

@router.get("/playbooks", response_model=List[PlaybookResponse])
async def get_playbooks(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await incident_service.get_playbooks(session, tid)


# ── Root Cause Analysis (RCA) ──

@router.post("/incidents/{incident_id}/rca", response_model=RootCauseAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_rca(incident_id: uuid.UUID, data: RootCauseAnalysisCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    rca = await incident_service.create_rca(session, tid, incident_id, data)
    await session.commit()
    return rca
