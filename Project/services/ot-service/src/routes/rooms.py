"""
MedTrustX OT Management Service — Rooms Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.ot import OTRoomCreate, OTRoomResponse
from src.services import ot_service

router = APIRouter(prefix="/ot-rooms", tags=["OT Rooms"])

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
    response_model=OTRoomResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Operation Theatre",
)
async def add_ot_room(
    data: OTRoomCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    room = await ot_service.add_ot_room(session, tenant_id, data)
    await session.commit()
    return room

@router.get(
    "/",
    response_model=List[OTRoomResponse],
    summary="List all Operation Theatres",
)
async def list_ot_rooms(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await ot_service.get_ot_rooms(session, tenant_id)
