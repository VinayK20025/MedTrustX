"""
MedTrustX Break-Glass — API Routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.break_glass import (
    ApprovalCreate, ApprovalResponse, AuditResponse,
    BreakGlassRequestCreate, BreakGlassRequestResponse, SessionResponse,
)
from src.services import break_glass_service

router = APIRouter(prefix="/break-glass", tags=["Emergency Break-Glass Access"])


def _get_tenant_id(request: Request) -> str:
    raw = getattr(request.state, "tenant_id", None)
    return str(raw) if raw else "tenant_apollo"


@router.post("/request", response_model=BreakGlassRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(data: BreakGlassRequestCreate, request: Request, session: AsyncSession = Depends(get_session)):
    """Submit emergency break-glass access request."""
    tid = _get_tenant_id(request)
    bg_request = await break_glass_service.create_request(session, tid, data)
    await session.commit()
    return bg_request


@router.post("/{id}/approve", response_model=ApprovalResponse, status_code=status.HTTP_201_CREATED)
async def approve_request(id: str, data: ApprovalCreate, request: Request, session: AsyncSession = Depends(get_session)):
    """Approve or deny a break-glass request."""
    tid = _get_tenant_id(request)
    try:
        approval = await break_glass_service.approve_request(session, tid, id, data)
        await session.commit()
        return approval
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/{id}/activate", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def activate_session(id: str, request: Request, session: AsyncSession = Depends(get_session)):
    """Activate time-bound elevated session after approval."""
    tid = _get_tenant_id(request)
    try:
        bg_session = await break_glass_service.activate_session(session, tid, id)
        await session.commit()
        return bg_session
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/sessions/{id}", response_model=SessionResponse)
async def get_session_detail(id: str, request: Request, session: AsyncSession = Depends(get_session)):
    """Get session details — auto-expires if past duration."""
    tid = _get_tenant_id(request)
    bg_session = await break_glass_service.get_session_by_id(session, tid, id)
    if not bg_session:
        raise HTTPException(status_code=404, detail="Session not found")
    await session.commit()
    return bg_session


@router.get("/audit", response_model=List[AuditResponse])
async def list_audit(request: Request, session_id: Optional[str] = Query(None), session: AsyncSession = Depends(get_session)):
    """Immutable audit trail — every action during break-glass sessions."""
    tid = _get_tenant_id(request)
    return await break_glass_service.list_audit(session, tid, session_id)
