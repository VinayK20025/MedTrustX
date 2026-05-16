"""
MedTrustX Facilities Service — Rooms Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.facilities import RoomCreate, RoomResponse, RoomUpdate
from src.services import facilities_service

router = APIRouter(prefix="/rooms", tags=["Rooms"])

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
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new room to a facility",
)
async def create_room(
    data: RoomCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        room = await facilities_service.create_room(session, tenant_id, data)
        await session.commit()
        return room
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{room_id}",
    response_model=RoomResponse,
    summary="Get specific room details",
)
async def get_room(
    room_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    room = await facilities_service.get_room(session, tenant_id, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.put(
    "/{room_id}",
    response_model=RoomResponse,
    summary="Update room status (e.g. mark for cleaning)",
)
async def update_room(
    room_id: uuid.UUID,
    data: RoomUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    room = await facilities_service.update_room_status(session, tenant_id, room_id, data)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await session.commit()
    return room
