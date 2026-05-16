"""
MedTrustX RCM Service — Claims Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.rcm import (
    AdjudicationCreate,
    AdjudicationResponse,
    ClaimCreate,
    ClaimResponse,
    ClaimUpdate,
    DenialCreate,
    DenialResponse,
)
from src.services import rcm_service

router = APIRouter(prefix="/claims", tags=["Claims"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=ClaimResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new insurance claim",
)
async def create_claim(
    data: ClaimCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    claim = await rcm_service.create_claim(session, tenant_id, data)
    await session.commit()
    return await rcm_service.get_claim(session, tenant_id, claim.id)

@router.get(
    "/{claim_id}",
    response_model=ClaimResponse,
    summary="Get claim details including line items",
)
async def get_claim(
    claim_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    claim = await rcm_service.get_claim(session, tenant_id, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.put(
    "/{claim_id}",
    response_model=ClaimResponse,
    summary="Update claim status (e.g., mark as submitted)",
)
async def update_claim(
    claim_id: uuid.UUID,
    data: ClaimUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    claim = await rcm_service.update_claim_status(session, tenant_id, claim_id, data)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    await session.commit()
    return await rcm_service.get_claim(session, tenant_id, claim_id)

@router.post(
    "/{claim_id}/adjudicate",
    response_model=AdjudicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record payer adjudication response",
)
async def adjudicate_claim(
    claim_id: uuid.UUID,
    data: AdjudicationCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        adj = await rcm_service.process_adjudication(session, tenant_id, claim_id, data)
        await session.commit()
        return adj
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post(
    "/{claim_id}/deny",
    response_model=DenialResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record claim denial reason",
)
async def deny_claim(
    claim_id: uuid.UUID,
    data: DenialCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        denial = await rcm_service.record_denial(session, tenant_id, claim_id, data)
        await session.commit()
        return denial
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
