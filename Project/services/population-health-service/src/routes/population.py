"""
MedTrustX Population Health Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.population import (
    CareGapResponse,
    InterventionCreateRequest,
    InterventionResponse,
    MemberResponse,
    PopulationCreateRequest,
    PopulationResponse,
    RiskProfileResponse,
)
from src.services import population_service

router = APIRouter(tags=["Population Health"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Populations ──

@router.post("/populations", response_model=PopulationResponse, status_code=status.HTTP_201_CREATED, summary="Create population cohort")
async def create_population(data: PopulationCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    pop = await population_service.create_population(session, tid, data)
    await session.commit()
    return pop


@router.get("/populations", response_model=List[PopulationResponse], summary="List populations")
async def list_populations(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await population_service.list_populations(session, tid)


@router.get("/populations/{pop_id}", response_model=PopulationResponse, summary="Get population")
async def get_population(pop_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    pop = await population_service.get_population(session, tid, pop_id)
    if not pop:
        raise HTTPException(status_code=404, detail="Population not found")
    return pop


@router.get("/populations/{pop_id}/members", response_model=List[MemberResponse], summary="List population members")
async def list_members(pop_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await population_service.get_members(session, tid, pop_id)


# ── Risk Profiles ──

@router.get("/risk-profiles/{patient_id}", response_model=List[RiskProfileResponse], summary="Get patient risk profiles")
async def get_risk_profiles(patient_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await population_service.get_risk_profiles(session, tid, patient_id)


# ── Care Gaps ──

@router.get("/care-gaps", response_model=List[CareGapResponse], summary="List care gaps")
async def list_care_gaps(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await population_service.get_care_gaps(session, tid)


# ── Interventions ──

@router.post("/interventions", response_model=InterventionResponse, status_code=status.HTTP_201_CREATED, summary="Create intervention")
async def create_intervention(data: InterventionCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    intv = await population_service.create_intervention(session, tid, data)
    await session.commit()
    return intv


@router.get("/interventions", response_model=List[InterventionResponse], summary="List interventions")
async def list_interventions(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await population_service.list_interventions(session, tid)
