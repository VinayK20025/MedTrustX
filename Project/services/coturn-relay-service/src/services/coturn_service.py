"""
MedTrustX Coturn Relay Service — Business Logic Layer

Turn credentials, sessions, and usage logs.
"""
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.coturn import (
    RelayUsageLog,
    TurnCredential,
    TurnSession,
)
from src.schemas.coturn import (
    RelayUsageLogCreate,
    TurnCredentialCreate,
    TurnSessionCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Credentials ──

async def generate_credential(
    session: AsyncSession, tenant_id: uuid.UUID, data: TurnCredentialCreate
) -> TurnCredential:
    # Basic mock of Coturn short-lived credential generation
    raw_cred = secrets.token_urlsafe(16)
    expires = datetime.now(timezone.utc) + timedelta(hours=24)
    
    cred = TurnCredential(
        tenant_id=tenant_id,
        username=data.username,
        credential=raw_cred,
        expires_at=expires,
    )
    session.add(cred)
    await session.flush()
    return cred


# ── Sessions ──

async def register_session(
    session: AsyncSession, tenant_id: uuid.UUID, data: TurnSessionCreate
) -> TurnSession:
    ts = TurnSession(
        tenant_id=tenant_id,
        user_id=data.user_id,
        session_id=data.session_id,
        relay_ip=data.relay_ip,
    )
    session.add(ts)
    await session.flush()
    await publish_event("TURN_SESSION_CREATED", tenant_id, ts.id, {"session_id": data.session_id})
    return ts


async def end_session(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: str
) -> Optional[TurnSession]:
    result = await session.execute(
        select(TurnSession).where(and_(TurnSession.session_id == session_id, TurnSession.tenant_id == tenant_id, TurnSession.deleted_at.is_(None)))
    )
    ts = result.scalar_one_or_none()
    if ts and not ts.ended_at:
        ts.ended_at = datetime.now(timezone.utc)
        await session.flush()
        await publish_event("TURN_SESSION_ENDED", tenant_id, ts.id, {"session_id": session_id})
    return ts


async def get_session_by_id(
    session: AsyncSession, tenant_id: uuid.UUID, turn_id: uuid.UUID
) -> Optional[TurnSession]:
    result = await session.execute(
        select(TurnSession).where(and_(TurnSession.id == turn_id, TurnSession.tenant_id == tenant_id, TurnSession.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Usage Logs ──

async def log_usage(
    session: AsyncSession, tenant_id: uuid.UUID, data: RelayUsageLogCreate
) -> RelayUsageLog:
    log = RelayUsageLog(
        tenant_id=tenant_id,
        session_id=data.session_id,
        bytes_transferred=data.bytes_transferred,
    )
    session.add(log)
    await session.flush()
    await publish_event("RELAY_USAGE_RECORDED", tenant_id, log.id, {"session_id": data.session_id, "bytes": data.bytes_transferred})
    return log


async def get_usage_for_session(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: str
) -> List[RelayUsageLog]:
    result = await session.execute(
        select(RelayUsageLog).where(and_(RelayUsageLog.session_id == session_id, RelayUsageLog.tenant_id == tenant_id, RelayUsageLog.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
