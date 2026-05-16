"""
MedTrustX Clinical Research Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.research import (
    CohortCreateRequest,
    CohortResponse,
    ParticipantEnrollRequest,
    ParticipantResponse,
    ResearchDataCollectRequest,
    ResearchDataResponse,
    StudyCreateRequest,
    StudyEventResponse,
    StudyResponse,
    StudyUpdateRequest,
)
from src.services import research_service

router = APIRouter(tags=["Clinical Research"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Studies ──

@router.post("/studies", response_model=StudyResponse, status_code=status.HTTP_201_CREATED, summary="Create study")
async def create_study(data: StudyCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    study = await research_service.create_study(session, tid, data)
    await session.commit()
    return study


@router.get("/studies/{study_id}", response_model=StudyResponse, summary="Get study")
async def get_study(study_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    study = await research_service.get_study(session, tid, study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return study


@router.put("/studies/{study_id}", response_model=StudyResponse, summary="Update study")
async def update_study(study_id: uuid.UUID, data: StudyUpdateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    study = await research_service.update_study(session, tid, study_id, data)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    await session.commit()
    return study


# ── Participants ──

@router.post("/studies/{study_id}/participants", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED, summary="Enroll participant")
async def enroll_participant(study_id: uuid.UUID, data: ParticipantEnrollRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    participant = await research_service.enroll_participant(session, tid, study_id, data)
    await session.commit()
    return participant


@router.get("/studies/{study_id}/participants", response_model=List[ParticipantResponse], summary="List participants")
async def list_participants(study_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await research_service.get_participants(session, tid, study_id)


# ── Cohorts ──

@router.post("/cohorts", response_model=CohortResponse, status_code=status.HTTP_201_CREATED, summary="Create cohort")
async def create_cohort(data: CohortCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    cohort = await research_service.create_cohort(session, tid, data)
    await session.commit()
    return cohort


@router.get("/cohorts/{cohort_id}", response_model=CohortResponse, summary="Get cohort")
async def get_cohort(cohort_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    cohort = await research_service.get_cohort(session, tid, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    return cohort


# ── Research Data ──

@router.post("/research-data", response_model=ResearchDataResponse, status_code=status.HTTP_201_CREATED, summary="Collect research data")
async def collect_data(data: ResearchDataCollectRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    rd = await research_service.collect_data(session, tid, data)
    await session.commit()
    return rd


@router.get("/research-data", response_model=List[ResearchDataResponse], summary="List research data")
async def list_research_data(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await research_service.get_research_data(session, tid)


# ── Study Events ──

@router.get("/studies/{study_id}/events", response_model=List[StudyEventResponse], summary="Get study events")
async def get_study_events(study_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await research_service.get_study_events(session, tid, study_id)
