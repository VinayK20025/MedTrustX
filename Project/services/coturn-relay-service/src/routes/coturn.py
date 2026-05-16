"""
MedTrustX Coturn Relay Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.coturn import (
    TurnCredentialCreate, TurnCredentialResponse,
    TurnSessionResponse,
    RelayUsageLogResponse
)
from src.services import coturn_service

router = APIRouter(tags=["Coturn Relay Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Credentials ──

@router.post("/turn/credentials", response_model=TurnCredentialResponse, status_code=status.HTTP_201_CREATED)
async def generate_credential(data: TurnCredentialCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    cred = await coturn_service.generate_credential(session, tid, data)
    await session.commit()
    return cred


# ── Sessions ──

@router.get("/turn/sessions/{session_uuid}", response_model=TurnSessionResponse)
async def get_session_by_id(session_uuid: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    turn_session = await coturn_service.get_session_by_id(session, tid, session_uuid)
    if not turn_session:
        raise HTTPException(status_code=404, detail="Turn session not found")
    return turn_session


# ── Usage ──

@router.get("/turn/usage/{session_id}", response_model=List[RelayUsageLogResponse])
async def get_usage_for_session(session_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await coturn_service.get_usage_for_session(session, tid, session_id)
