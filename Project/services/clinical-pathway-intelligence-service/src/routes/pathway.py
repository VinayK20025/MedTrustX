"""
MedTrustX Clinical Pathway Intelligence Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.pathway import (
    JourneyCreate, JourneyResponse, PathwayCreate,
    PathwayResponse, VarianceResponse
)
from src.services import pathway_service

router = APIRouter(tags=["Clinical Pathway Intelligence Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Pathways ──

@router.post("/pathways", response_model=PathwayResponse, status_code=status.HTTP_201_CREATED)
async def create_pathway(data: PathwayCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    pathway = await pathway_service.create_pathway(session, tid, data)
    await session.commit()
    return pathway


@router.get("/pathways/{id}", response_model=PathwayResponse)
async def get_pathway(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    pathway = await pathway_service.get_pathway(session, tid, id)
    if not pathway:
        raise HTTPException(status_code=404, detail="Pathway not found")
    return pathway


# ── Journeys ──

@router.post("/journeys", response_model=JourneyResponse, status_code=status.HTTP_201_CREATED)
async def create_journey(data: JourneyCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    journey = await pathway_service.create_journey(session, tid, data)
    await session.commit()
    return journey


@router.get("/journeys/{patient_id}", response_model=List[JourneyResponse])
async def get_patient_journeys(patient_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await pathway_service.get_patient_journeys(session, tid, patient_id)


# ── Variances ──

@router.get("/variances", response_model=List[VarianceResponse])
async def get_variances(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await pathway_service.get_variances(session, tid)
