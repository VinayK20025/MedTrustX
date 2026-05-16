"""
MedTrustX Telemedicine Service — Business Logic Layer
"""
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.telemedicine import TeleSession, SessionParticipant, SessionEvent, Recording, SessionToken
from src.schemas.telemedicine import (
    TeleSessionCreate, TeleSessionUpdate, ParticipantCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Sessions ──

async def create_session(
    session: AsyncSession, tenant_id: uuid.UUID, data: TeleSessionCreate
) -> TeleSession:
    tele_session = TeleSession(
        tenant_id=tenant_id,
        appointment_id=data.appointment_id,
        patient_id=data.patient_id,
        doctor_id=data.doctor_id,
        scheduled_at=data.scheduled_at,
        status="scheduled"
    )
    session.add(tele_session)
    await session.flush()

    event = SessionEvent(
        tenant_id=tenant_id,
        session_id=tele_session.id,
        event_type="SESSION_CREATED",
        payload={"scheduled_at": data.scheduled_at.isoformat() if data.scheduled_at else None}
    )
    session.add(event)
    await session.flush()

    await publish_event("SESSION_CREATED", tenant_id, tele_session.id, {
        "session_id": str(tele_session.id),
        "appointment_id": str(tele_session.appointment_id) if tele_session.appointment_id else None,
        "patient_id": str(tele_session.patient_id),
    })
    return tele_session

async def get_session(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID
) -> Optional[TeleSession]:
    result = await session.execute(
        select(TeleSession)
        .options(
            selectinload(TeleSession.participants),
            selectinload(TeleSession.recordings),
            selectinload(TeleSession.events),
        )
        .where(and_(TeleSession.id == session_id, TeleSession.tenant_id == tenant_id, TeleSession.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_session(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID, data: TeleSessionUpdate
) -> Optional[TeleSession]:
    tele_session = await get_session(session, tenant_id, session_id)
    if not tele_session:
        return None

    if data.status and data.status != tele_session.status:
        tele_session.status = data.status
        tele_session.updated_at = datetime.now(timezone.utc)
    if data.scheduled_at:
        tele_session.scheduled_at = data.scheduled_at
        tele_session.updated_at = datetime.now(timezone.utc)

    await session.flush()
    return tele_session

async def start_session(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID
) -> Optional[TeleSession]:
    tele_session = await get_session(session, tenant_id, session_id)
    if not tele_session:
        return None
    
    if tele_session.status != "in_progress":
        tele_session.status = "in_progress"
        tele_session.started_at = datetime.now(timezone.utc)
        tele_session.updated_at = tele_session.started_at
        
        event = SessionEvent(
            tenant_id=tenant_id,
            session_id=tele_session.id,
            event_type="SESSION_STARTED",
            payload={}
        )
        session.add(event)
        
        await publish_event("SESSION_STARTED", tenant_id, tele_session.id, {
            "session_id": str(tele_session.id),
            "appointment_id": str(tele_session.appointment_id) if tele_session.appointment_id else None,
        })
    await session.flush()
    return tele_session

async def end_session(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID
) -> Optional[TeleSession]:
    tele_session = await get_session(session, tenant_id, session_id)
    if not tele_session:
        return None
    
    if tele_session.status != "completed":
        tele_session.status = "completed"
        tele_session.ended_at = datetime.now(timezone.utc)
        tele_session.updated_at = tele_session.ended_at
        
        # update all active participants to leave
        for participant in tele_session.participants:
            if participant.leave_time is None:
                participant.leave_time = tele_session.ended_at
        
        event = SessionEvent(
            tenant_id=tenant_id,
            session_id=tele_session.id,
            event_type="SESSION_ENDED",
            payload={}
        )
        session.add(event)

        await publish_event("SESSION_ENDED", tenant_id, tele_session.id, {
            "session_id": str(tele_session.id),
            "appointment_id": str(tele_session.appointment_id) if tele_session.appointment_id else None,
        })
    await session.flush()
    return tele_session

async def list_sessions(
    session: AsyncSession, tenant_id: uuid.UUID, page: int = 1, page_size: int = 50
) -> Tuple[List[TeleSession], int]:
    query = select(TeleSession).where(and_(TeleSession.tenant_id == tenant_id, TeleSession.deleted_at.is_(None)))
    count_result = await session.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    offset = (page - 1) * page_size
    result = await session.execute(query.order_by(TeleSession.created_at.desc()).limit(page_size).offset(offset))
    return list(result.scalars().all()), total

# ── Participants ──

async def add_participant(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID, data: ParticipantCreate
) -> SessionParticipant:
    tele_session = await get_session(session, tenant_id, session_id)
    if not tele_session:
        raise ValueError("Session not found")

    participant = SessionParticipant(
        tenant_id=tenant_id,
        session_id=tele_session.id,
        user_id=data.user_id,
        role=data.role,
        join_time=datetime.now(timezone.utc)
    )
    session.add(participant)
    
    event = SessionEvent(
        tenant_id=tenant_id,
        session_id=tele_session.id,
        event_type="PARTICIPANT_JOINED",
        payload={"user_id": str(data.user_id), "role": data.role}
    )
    session.add(event)
    await session.flush()

    await publish_event("PARTICIPANT_JOINED", tenant_id, tele_session.id, {
        "session_id": str(tele_session.id),
        "user_id": str(data.user_id),
        "role": data.role,
    })
    return participant

async def get_participants(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID
) -> List[SessionParticipant]:
    result = await session.execute(
        select(SessionParticipant).where(and_(SessionParticipant.tenant_id == tenant_id, SessionParticipant.session_id == session_id, SessionParticipant.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

# ── Tokens ──

async def generate_join_token(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID
) -> SessionToken:
    tele_session = await get_session(session, tenant_id, session_id)
    if not tele_session:
        raise ValueError("Session not found")

    token_str = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=2)

    token = SessionToken(
        tenant_id=tenant_id,
        session_id=tele_session.id,
        token=token_str,
        expires_at=expires
    )
    session.add(token)
    await session.flush()
    return token

# ── Events ──

async def get_session_events(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID
) -> List[SessionEvent]:
    result = await session.execute(
        select(SessionEvent).where(and_(SessionEvent.tenant_id == tenant_id, SessionEvent.session_id == session_id, SessionEvent.deleted_at.is_(None))).order_by(SessionEvent.created_at.desc())
    )
    return list(result.scalars().all())
