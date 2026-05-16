"""
MedTrustX Forensic Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.forensic import (
    CustodyLogCreate, CustodyLogResponse,
    EvidenceItemCreate, EvidenceItemResponse,
    ExternalRequestCreate, ExternalRequestResponse,
    ForensicReportCreate, ForensicReportResponse,
    MLCCaseCreate, MLCCaseResponse
)
from src.services import forensic_service

router = APIRouter(tags=["Forensic Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── MLC Cases ──

@router.post("/forensic/cases", response_model=MLCCaseResponse, status_code=status.HTTP_201_CREATED)
async def register_case(data: MLCCaseCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    mlc_case = await forensic_service.register_case(session, tid, data)
    await session.commit()
    return mlc_case

@router.get("/forensic/cases/{case_id}", response_model=MLCCaseResponse)
async def get_case(case_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    mlc_case = await forensic_service.get_case(session, tid, case_id)
    if not mlc_case:
        raise HTTPException(status_code=404, detail="Case not found")
    return mlc_case


# ── Evidence ──

@router.post("/evidence", response_model=EvidenceItemResponse, status_code=status.HTTP_201_CREATED)
async def collect_evidence(data: EvidenceItemCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    evidence = await forensic_service.collect_evidence(session, tid, data)
    await session.commit()
    return evidence

@router.get("/evidence/{evidence_id}", response_model=EvidenceItemResponse)
async def get_evidence(evidence_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    evidence = await forensic_service.get_evidence(session, tid, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence


# ── Custody Logs ──

@router.post("/custody-logs", response_model=CustodyLogResponse, status_code=status.HTTP_201_CREATED)
async def log_custody(data: CustodyLogCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    log = await forensic_service.log_custody(session, tid, data)
    await session.commit()
    return log

@router.get("/custody-logs/{evidence_id}", response_model=List[CustodyLogResponse])
async def get_custody_logs(evidence_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await forensic_service.get_custody_logs(session, tid, evidence_id)


# ── Forensic Reports ──

@router.post("/forensic-reports", response_model=ForensicReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_report(data: ForensicReportCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    report = await forensic_service.submit_report(session, tid, data)
    await session.commit()
    return report

@router.get("/forensic-reports/{report_id}", response_model=ForensicReportResponse)
async def get_report(report_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    report = await forensic_service.get_report(session, tid, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# ── External Requests ──

@router.post("/external-requests", response_model=ExternalRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_external_request(data: ExternalRequestCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    req = await forensic_service.create_external_request(session, tid, data)
    await session.commit()
    return req

@router.get("/external-requests/{request_id}", response_model=ExternalRequestResponse)
async def get_external_request(request_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    req = await forensic_service.get_external_request(session, tid, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req
