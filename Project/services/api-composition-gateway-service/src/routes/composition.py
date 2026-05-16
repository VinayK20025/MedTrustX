"""
MedTrustX API Composition Gateway Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.composition import ComposeRequest, ComposeResponse, CompositionCreate, CompositionLogResponse, CompositionResponse, CompositionRouteResponse
from src.services import composition_service

router = APIRouter(tags=["API Composition Gateway Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/compositions", response_model=CompositionResponse, status_code=status.HTTP_201_CREATED)
async def create_composition(data: CompositionCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    comp = await composition_service.create_composition(session, tid, data)
    await session.commit()
    return comp

@router.get("/compositions/{id}", response_model=CompositionResponse)
async def get_composition(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    comp = await composition_service.get_composition(session, tid, id)
    if not comp:
        raise HTTPException(status_code=404, detail="Composition not found")
    return comp

@router.post("/compose", response_model=ComposeResponse)
async def execute_composition(data: ComposeRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    try:
        resp = await composition_service.execute_composition(session, tid, data)
        await session.commit()
        return resp
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/routes", response_model=List[CompositionRouteResponse])
async def list_routes(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await composition_service.list_routes(session, tid)

@router.get("/logs", response_model=List[CompositionLogResponse])
async def list_logs(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await composition_service.list_logs(session, tid)
