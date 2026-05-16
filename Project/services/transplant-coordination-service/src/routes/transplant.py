"""
MedTrustX Transplant Coordination Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.transplant import (
    DonorCreate, DonorResponse,
    MatchCreate, MatchResponse,
    RecipientCreate, RecipientResponse,
    TransplantEventResponse,
    WaitlistResponse
)
from src.services import transplant_service

router = APIRouter(tags=["Transplant Coordination Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Donors ──

@router.post("/donors", response_model=DonorResponse, status_code=status.HTTP_201_CREATED)
async def register_donor(data: DonorCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    donor = await transplant_service.register_donor(session, tid, data)
    await session.commit()
    return donor

@router.get("/donors/{donor_id}", response_model=DonorResponse)
async def get_donor(donor_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    donor = await transplant_service.get_donor(session, tid, donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    return donor


# ── Recipients ──

@router.post("/recipients", response_model=RecipientResponse, status_code=status.HTTP_201_CREATED)
async def register_recipient(data: RecipientCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    recipient = await transplant_service.register_recipient(session, tid, data)
    await session.commit()
    return recipient

@router.get("/recipients/{recipient_id}", response_model=RecipientResponse)
async def get_recipient(recipient_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    recipient = await transplant_service.get_recipient(session, tid, recipient_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    return recipient


# ── Waitlists ──

@router.get("/waitlists", response_model=List[WaitlistResponse])
async def get_waitlists(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await transplant_service.get_waitlists(session, tid)


# ── Matches ──

@router.post("/matches", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def create_match(data: MatchCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    match = await transplant_service.create_match(session, tid, data)
    await session.commit()
    return match

@router.get("/matches/{match_id}", response_model=MatchResponse)
async def get_match(match_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    match = await transplant_service.get_match(session, tid, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


# ── Transplant Events ──

@router.get("/transplant-events", response_model=List[TransplantEventResponse])
async def get_transplant_events(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await transplant_service.get_transplant_events(session, tid)
