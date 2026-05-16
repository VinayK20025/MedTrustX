"""
MedTrustX Visitor Management Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.visitor import LogResponse, VisitCreate, VisitorCreate, VisitorResponse, VisitResponse
from src.services import visitor_service

router = APIRouter(tags=["Visitor Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/visitors", response_model=VisitorResponse, status_code=status.HTTP_201_CREATED)
async def create_visitor(data: VisitorCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    v = await visitor_service.create_visitor(session, tid, data)
    await session.commit()
    return v

@router.post("/visits", response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
async def create_visit(data: VisitCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    v = await visitor_service.create_visit(session, tid, data)
    await session.commit()
    return v

@router.get("/visits/{id}", response_model=VisitResponse)
async def get_visit(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    v = await visitor_service.get_visit(session, tid, id)
    if not v:
        raise HTTPException(status_code=404, detail="Visit not found")
    return v

@router.post("/visits/{id}/check-in", response_model=VisitResponse)
async def check_in(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    v = await visitor_service.check_in(session, tid, id)
    if not v:
        raise HTTPException(status_code=400, detail="Visit cannot be checked in")
    await session.commit()
    return v

@router.post("/visits/{id}/check-out", response_model=VisitResponse)
async def check_out(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    v = await visitor_service.check_out(session, tid, id)
    if not v:
        raise HTTPException(status_code=400, detail="Visit cannot be checked out")
    await session.commit()
    return v

@router.get("/logs", response_model=List[LogResponse])
async def list_logs(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await visitor_service.list_logs(session, tid)
