"""
MedTrustX Zero Trust Network Control Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.zt_network import AccessEvaluate, DecisionResponse, PolicyCreate, PolicyResponse, SessionCreate, SessionResponse
from src.services import zt_control_service

router = APIRouter(tags=["Zero Trust Network Control Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/policies", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(data: PolicyCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    pol = await zt_control_service.create_policy(session, tid, data)
    await session.commit()
    return pol

@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(data: SessionCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sess = await zt_control_service.create_session(session, tid, data)
    await session.commit()
    return sess

@router.get("/sessions/{id}", response_model=SessionResponse)
async def get_session(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sess = await zt_control_service.get_session(session, tid, id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    return sess

@router.post("/access/evaluate", response_model=DecisionResponse, status_code=status.HTTP_200_OK)
async def evaluate_access(data: AccessEvaluate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    dec = await zt_control_service.evaluate_access(session, tid, data)
    await session.commit()
    if dec.decision == "deny":
        raise HTTPException(status_code=403, detail="Access denied by policy")
    return dec

@router.get("/decisions", response_model=List[DecisionResponse])
async def list_decisions(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await zt_control_service.list_decisions(session, tid)
