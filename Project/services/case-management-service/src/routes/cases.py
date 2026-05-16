"""
MedTrustX Case Management Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.case_management import (
    CarePlanCreate, CarePlanResponse,
    CaseCreate, CaseNoteCreate,
    CaseNoteResponse, CaseOutcomeCreate,
    CaseOutcomeResponse, CaseResponse,
    CaseTaskCreate, CaseTaskResponse
)
from src.services import case_service

router = APIRouter(tags=["Case Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Cases ──

@router.post("/cases", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(data: CaseCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    case = await case_service.create_case(session, tid, data)
    await session.commit()
    return case

@router.get("/cases/{case_id}", response_model=CaseResponse)
async def get_case(case_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    case = await case_service.get_case(session, tid, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


# ── Care Plans ──

@router.post("/cases/{case_id}/care-plans", response_model=CarePlanResponse, status_code=status.HTTP_201_CREATED)
async def create_care_plan(case_id: uuid.UUID, data: CarePlanCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    plan = await case_service.create_care_plan(session, tid, case_id, data)
    await session.commit()
    return plan

@router.get("/cases/{case_id}/care-plans", response_model=List[CarePlanResponse])
async def get_care_plans(case_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await case_service.get_care_plans(session, tid, case_id)


# ── Case Tasks ──

@router.post("/cases/{case_id}/tasks", response_model=CaseTaskResponse, status_code=status.HTTP_201_CREATED)
async def assign_task(case_id: uuid.UUID, data: CaseTaskCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    task = await case_service.assign_task(session, tid, case_id, data)
    await session.commit()
    return task

@router.get("/cases/{case_id}/tasks", response_model=List[CaseTaskResponse])
async def get_tasks(case_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await case_service.get_tasks(session, tid, case_id)


# ── Case Notes ──

@router.post("/cases/{case_id}/notes", response_model=CaseNoteResponse, status_code=status.HTTP_201_CREATED)
async def add_note(case_id: uuid.UUID, data: CaseNoteCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    note = await case_service.add_note(session, tid, case_id, data)
    await session.commit()
    return note


# ── Case Outcomes ──

@router.post("/cases/{case_id}/outcomes", response_model=CaseOutcomeResponse, status_code=status.HTTP_201_CREATED)
async def record_outcome(case_id: uuid.UUID, data: CaseOutcomeCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    outcome = await case_service.record_outcome(session, tid, case_id, data)
    await session.commit()
    return outcome

@router.get("/cases/{case_id}/outcomes", response_model=List[CaseOutcomeResponse])
async def get_outcomes(case_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await case_service.get_outcomes(session, tid, case_id)
