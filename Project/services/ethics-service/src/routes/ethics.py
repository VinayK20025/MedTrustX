"""
MedTrustX Ethics Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.ethics import (
    CommitteeMemberCreate, CommitteeMemberResponse,
    ConflictDeclarationCreate, ConflictDeclarationResponse,
    EthicsCaseCreate, EthicsCaseResponse,
    EthicsPolicyCreate, EthicsPolicyResponse,
    EthicsReviewCreate, EthicsReviewResponse
)
from src.services import ethics_service

router = APIRouter(tags=["Ethics"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Cases ──

@router.post("/ethics/cases", response_model=EthicsCaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(data: EthicsCaseCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    case = await ethics_service.create_case(session, tid, data)
    await session.commit()
    return case

@router.get("/ethics/cases/{case_id}", response_model=EthicsCaseResponse)
async def get_case(case_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    case = await ethics_service.get_case(session, tid, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


# ── Reviews ──

@router.post("/ethics/cases/{case_id}/reviews", response_model=EthicsReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(case_id: uuid.UUID, data: EthicsReviewCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    try:
        review = await ethics_service.submit_review(session, tid, case_id, data)
        await session.commit()
        return review
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Committee ──

@router.post("/ethics/committee", response_model=CommitteeMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_committee_member(data: CommitteeMemberCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    member = await ethics_service.add_committee_member(session, tid, data)
    await session.commit()
    return member

@router.get("/ethics/committee", response_model=List[CommitteeMemberResponse])
async def get_committee(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await ethics_service.get_committee(session, tid)


# ── Conflicts ──

@router.post("/ethics/conflicts", response_model=ConflictDeclarationResponse, status_code=status.HTTP_201_CREATED)
async def declare_conflict(data: ConflictDeclarationCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    conflict = await ethics_service.declare_conflict(session, tid, data)
    await session.commit()
    return conflict


# ── Policies ──

@router.post("/ethics/policies", response_model=EthicsPolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(data: EthicsPolicyCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    policy = await ethics_service.create_policy(session, tid, data)
    await session.commit()
    return policy

@router.get("/ethics/policies", response_model=List[EthicsPolicyResponse])
async def get_policies(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await ethics_service.get_policies(session, tid)
