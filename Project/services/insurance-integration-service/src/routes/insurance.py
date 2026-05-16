"""
MedTrustX Insurance Integration Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.insurance import (
    ClaimCreate, ClaimResponse, ClaimStatusUpdateResponse,
    EligibilityCheckCreate, EligibilityCheckResponse,
    PreauthorizationCreate, PreauthorizationResponse,
    RemittanceCreate, RemittanceResponse
)
from src.services import insurance_service

router = APIRouter(tags=["Insurance Integration Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Eligibility ──

@router.post("/insurance/eligibility", response_model=EligibilityCheckResponse, status_code=status.HTTP_201_CREATED)
async def check_eligibility(data: EligibilityCheckCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    check = await insurance_service.perform_eligibility_check(session, tid, data)
    await session.commit()
    return check

@router.get("/insurance/eligibility/{check_id}", response_model=EligibilityCheckResponse)
async def get_eligibility(check_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    check = await insurance_service.get_eligibility_check(session, tid, check_id)
    if not check:
        raise HTTPException(status_code=404, detail="Eligibility check not found")
    return check


# ── Preauth ──

@router.post("/insurance/preauth", response_model=PreauthorizationResponse, status_code=status.HTTP_201_CREATED)
async def submit_preauth(data: PreauthorizationCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    preauth = await insurance_service.submit_preauth(session, tid, data)
    await session.commit()
    return preauth

@router.get("/insurance/preauth/{preauth_id}", response_model=PreauthorizationResponse)
async def get_preauth(preauth_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    preauth = await insurance_service.get_preauth(session, tid, preauth_id)
    if not preauth:
        raise HTTPException(status_code=404, detail="Preauthorization not found")
    return preauth


# ── Claims ──

@router.post("/insurance/claims", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
async def submit_claim(data: ClaimCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    claim = await insurance_service.submit_claim(session, tid, data)
    await session.commit()
    return claim

@router.get("/insurance/claims/{claim_id}", response_model=ClaimResponse)
async def get_claim(claim_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    claim = await insurance_service.get_claim(session, tid, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.get("/insurance/claims/{claim_id}/status", response_model=List[ClaimStatusUpdateResponse])
async def get_claim_status(claim_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await insurance_service.get_claim_status(session, tid, claim_id)


# ── Remittances ──

@router.post("/insurance/remittances", response_model=RemittanceResponse, status_code=status.HTTP_201_CREATED)
async def process_remittance(data: RemittanceCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    remittance = await insurance_service.process_remittance(session, tid, data)
    await session.commit()
    return remittance
