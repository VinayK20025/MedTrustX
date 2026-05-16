"""
MedTrustX Regulator Integration Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.regulator import (
    AcknowledgmentResponse,
    RegulatorCreate, RegulatorResponse,
    ReportDefinitionResponse,
    SubmissionCreate, SubmissionResponse
)
from src.services import regulator_service

router = APIRouter(tags=["Regulator Integration Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Regulators ──

@router.post("/regulators", response_model=RegulatorResponse, status_code=status.HTTP_201_CREATED)
async def create_regulator(data: RegulatorCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    regulator = await regulator_service.create_regulator(session, tid, data)
    await session.commit()
    return regulator

@router.get("/regulators/{regulator_id}", response_model=RegulatorResponse)
async def get_regulator(regulator_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    regulator = await regulator_service.get_regulator(session, tid, regulator_id)
    if not regulator:
        raise HTTPException(status_code=404, detail="Regulator not found")
    return regulator


# ── Report Definitions ──

@router.get("/report-definitions", response_model=List[ReportDefinitionResponse])
async def get_report_definitions(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await regulator_service.get_report_definitions(session, tid)


# ── Submissions ──

@router.post("/reports/submit", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_report(data: SubmissionCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    submission = await regulator_service.submit_report(session, tid, data)
    await session.commit()
    return submission

@router.get("/reports/{submission_id}", response_model=SubmissionResponse)
async def get_submission(submission_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    submission = await regulator_service.get_submission(session, tid, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission

@router.get("/submissions/{submission_id}/status", response_model=SubmissionResponse)
async def get_submission_status(submission_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    return await get_submission(submission_id, request, session)


# ── Acknowledgments ──

@router.get("/acknowledgments/{submission_id}", response_model=List[AcknowledgmentResponse])
async def get_acknowledgments(submission_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await regulator_service.get_acknowledgments(session, tid, submission_id)
