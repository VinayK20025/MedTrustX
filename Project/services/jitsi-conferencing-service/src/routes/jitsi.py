"""
MedTrustX Jitsi Conferencing Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from src.database import get_session
from src.schemas.jitsi import (
    ConferenceRoomCreate, ConferenceRoomResponse,
    ParticipantJoin, ParticipantResponse
)
from src.services import jitsi_service

router = APIRouter(tags=["Jitsi Conferencing Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

class LeaveRequest(BaseModel):
    user_id: uuid.UUID

# ── Rooms ──

@router.post("/conferences", response_model=ConferenceRoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(data: ConferenceRoomCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    room = await jitsi_service.create_room(session, tid, data)
    await session.commit()
    return room

@router.get("/conferences/{room_id}", response_model=ConferenceRoomResponse)
async def get_room(room_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    room = await jitsi_service.get_room(session, tid, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


# ── Participants ──

@router.post("/conferences/{room_id}/join", response_model=ParticipantResponse)
async def join_room(room_id: uuid.UUID, data: ParticipantJoin, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    participant = await jitsi_service.join_room(session, tid, room_id, data)
    await session.commit()
    return participant

@router.post("/conferences/{room_id}/leave")
async def leave_room(room_id: uuid.UUID, data: LeaveRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    result = await jitsi_service.leave_room(session, tid, room_id, data.user_id)
    await session.commit()
    return result

@router.get("/conferences/{room_id}/participants", response_model=List[ParticipantResponse])
async def get_participants(room_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await jitsi_service.get_participants(session, tid, room_id)
