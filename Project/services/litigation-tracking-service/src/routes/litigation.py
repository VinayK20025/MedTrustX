"""
MedTrustX Litigation Tracking Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.litigation import HearingCreate, HearingResponse, LitigationCreate, LitigationResponse, UpdateResponse
from src.services import litigation_service

router = APIRouter(tags=["Litigation Tracking Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/litigations", response_model=LitigationResponse, status_code=status.HTTP_201_CREATED)
async def create_litigation(data: LitigationCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    lit = await litigation_service.create_litigation(session, tid, data)
    await session.commit()
    return lit

@router.get("/litigations/{id}", response_model=LitigationResponse)
async def get_litigation(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    lit = await litigation_service.get_litigation(session, tid, id)
    if not lit:
        raise HTTPException(status_code=404, detail="Litigation not found")
    return lit

@router.post("/hearings", response_model=HearingResponse, status_code=status.HTTP_201_CREATED)
async def schedule_hearing(litigation_id: uuid.UUID, data: HearingCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    hearing = await litigation_service.schedule_hearing(session, tid, litigation_id, data)
    await session.commit()
    return hearing

@router.get("/hearings/{litigation_id}", response_model=List[HearingResponse])
async def list_hearings(litigation_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await litigation_service.list_hearings(session, tid, litigation_id)

@router.get("/updates", response_model=List[UpdateResponse])
async def list_updates(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await litigation_service.list_updates(session, tid)
