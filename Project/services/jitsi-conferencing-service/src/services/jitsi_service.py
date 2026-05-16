"""
MedTrustX Jitsi Conferencing Service — Business Logic Layer

Conference Rooms, Participants, and Sessions.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.jitsi import (
    ConferenceRoom,
    ConferenceSession,
    Participant,
)
from src.schemas.jitsi import (
    ConferenceRoomCreate,
    ParticipantJoin,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Conference Rooms ──

async def create_room(
    session: AsyncSession, tenant_id: uuid.UUID, data: ConferenceRoomCreate
) -> ConferenceRoom:
    room = ConferenceRoom(
        tenant_id=tenant_id,
        room_name=data.room_name,
        created_by=data.created_by,
    )
    session.add(room)
    await session.flush()
    await publish_event("CONFERENCE_CREATED", tenant_id, room.id, {"room_name": data.room_name})
    return room


async def get_room(
    session: AsyncSession, tenant_id: uuid.UUID, room_id: uuid.UUID
) -> Optional[ConferenceRoom]:
    result = await session.execute(
        select(ConferenceRoom).where(and_(ConferenceRoom.id == room_id, ConferenceRoom.tenant_id == tenant_id, ConferenceRoom.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Session & Participant Management ──

async def join_room(
    session: AsyncSession, tenant_id: uuid.UUID, room_id: uuid.UUID, data: ParticipantJoin
) -> Participant:
    # Ensure active session exists or create one
    active_session_res = await session.execute(
        select(ConferenceSession).where(and_(ConferenceSession.room_id == room_id, ConferenceSession.tenant_id == tenant_id, ConferenceSession.status == "active"))
    )
    active_session = active_session_res.scalar_one_or_none()
    
    if not active_session:
        active_session = ConferenceSession(
            tenant_id=tenant_id,
            room_id=room_id,
        )
        session.add(active_session)
        await session.flush()
        await publish_event("SESSION_STARTED", tenant_id, active_session.id, {"room_id": str(room_id)})

    # Add participant
    participant = Participant(
        tenant_id=tenant_id,
        room_id=room_id,
        user_id=data.user_id,
        role=data.role,
    )
    session.add(participant)
    await session.flush()
    await publish_event("PARTICIPANT_JOINED", tenant_id, room_id, {"user_id": str(data.user_id)})
    return participant


async def leave_room(
    session: AsyncSession, tenant_id: uuid.UUID, room_id: uuid.UUID, user_id: uuid.UUID
) -> dict:
    result = await session.execute(
        select(Participant).where(and_(Participant.room_id == room_id, Participant.user_id == user_id, Participant.tenant_id == tenant_id, Participant.deleted_at.is_(None)))
    )
    participant = result.scalar_one_or_none()
    if participant:
        participant.soft_delete()
        await session.flush()
        await publish_event("PARTICIPANT_LEFT", tenant_id, room_id, {"user_id": str(user_id)})
    return {"status": "left_successfully"}


async def get_participants(
    session: AsyncSession, tenant_id: uuid.UUID, room_id: uuid.UUID
) -> List[Participant]:
    result = await session.execute(
        select(Participant).where(and_(Participant.room_id == room_id, Participant.tenant_id == tenant_id, Participant.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
