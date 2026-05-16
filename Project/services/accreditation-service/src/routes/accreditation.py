"""
MedTrustX Accreditation Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.accreditation import (
    AccreditationAuditCreate, AccreditationAuditResponse,
    ChecklistCreate, ChecklistResponse,
    EvidenceCreate, EvidenceResponse,
    ProgramCreate, ProgramResponse,
    StandardCreate, StandardResponse
)
from src.services import accreditation_service

router = APIRouter(tags=["Accreditation"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Programs ──

@router.post("/accreditation/programs", response_model=ProgramResponse, status_code=status.HTTP_201_CREATED)
async def create_program(data: ProgramCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    prog = await accreditation_service.create_program(session, tid, data)
    await session.commit()
    return prog

@router.get("/accreditation/programs/{prog_id}", response_model=ProgramResponse)
async def get_program(prog_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    prog = await accreditation_service.get_program(session, tid, prog_id)
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found")
    return prog


# ── Standards ──

@router.post("/standards", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
async def create_standard(data: StandardCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    std = await accreditation_service.create_standard(session, tid, data)
    await session.commit()
    return std

@router.get("/standards/{std_id}", response_model=StandardResponse)
async def get_standard(std_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    std = await accreditation_service.get_standard(session, tid, std_id)
    if not std:
        raise HTTPException(status_code=404, detail="Standard not found")
    return std


# ── Checklists ──

@router.post("/checklists", response_model=ChecklistResponse, status_code=status.HTTP_201_CREATED)
async def create_checklist(data: ChecklistCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    chk = await accreditation_service.create_checklist(session, tid, data)
    await session.commit()
    return chk

@router.get("/checklists/{chk_id}", response_model=ChecklistResponse)
async def get_checklist(chk_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    chk = await accreditation_service.get_checklist(session, tid, chk_id)
    if not chk:
        raise HTTPException(status_code=404, detail="Checklist not found")
    return chk


# ── Evidence ──

@router.post("/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(data: EvidenceCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    ev = await accreditation_service.upload_evidence(session, tid, data)
    await session.commit()
    return ev

@router.get("/evidence/{ev_id}", response_model=EvidenceResponse)
async def get_evidence(ev_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    ev = await accreditation_service.get_evidence(session, tid, ev_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return ev


# ── Audits ──

@router.post("/audits", response_model=AccreditationAuditResponse, status_code=status.HTTP_201_CREATED)
async def create_audit(data: AccreditationAuditCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    audit = await accreditation_service.create_audit(session, tid, data)
    await session.commit()
    return audit

@router.get("/audits/{audit_id}", response_model=AccreditationAuditResponse)
async def get_audit(audit_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    audit = await accreditation_service.get_audit(session, tid, audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit
