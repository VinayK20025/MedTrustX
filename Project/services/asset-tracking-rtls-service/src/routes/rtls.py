"""
MedTrustX Asset Tracking RTLS Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.rtls import AssetCreate, AssetResponse, LocationResponse, MovementResponse, TagCreate, TagResponse
from src.services import rtls_service

router = APIRouter(tags=["Asset Tracking (RTLS) Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/assets", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(data: AssetCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    ast = await rtls_service.create_asset(session, tid, data)
    await session.commit()
    return ast

@router.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(data: TagCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    tg = await rtls_service.create_tag(session, tid, data)
    await session.commit()
    return tg

@router.get("/assets/{id}/location", response_model=LocationResponse)
async def get_location(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    loc = await rtls_service.get_latest_location(session, tid, id)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found for asset")
    return loc

@router.get("/movements", response_model=List[MovementResponse])
async def list_movements(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await rtls_service.list_movements(session, tid)

@router.get("/zones", response_model=List[str])
async def list_zones(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await rtls_service.list_zones(session, tid)
