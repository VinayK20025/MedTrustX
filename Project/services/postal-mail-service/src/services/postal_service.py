"""
MedTrustX Postal Mail Service — Business Logic Layer

Email queuing, logging, and sending state tracking.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.postal import (
    EmailBounce,
    EmailLog,
    EmailMessage,
)
from src.schemas.postal import (
    EmailMessageCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Emails ──

async def queue_email(
    session: AsyncSession, tenant_id: uuid.UUID, data: EmailMessageCreate
) -> EmailMessage:
    message = EmailMessage(
        tenant_id=tenant_id,
        to_address=data.to_address,
        subject=data.subject,
        body=data.body,
        status="pending",
    )
    session.add(message)
    await session.flush()
    
    # In a real system, this would drop it to a Celery/Redis queue for async SMTP delivery.
    # For now, we simulate immediate successful acceptance into the queue.
    
    log = EmailLog(
        tenant_id=tenant_id,
        message_id=message.id,
        status="queued",
        response="Added to delivery queue",
    )
    session.add(log)
    await session.flush()
    
    await publish_event("EMAIL_QUEUED", tenant_id, message.id, {"to": data.to_address, "subject": data.subject})
    return message


async def get_email(
    session: AsyncSession, tenant_id: uuid.UUID, message_id: uuid.UUID
) -> Optional[EmailMessage]:
    result = await session.execute(
        select(EmailMessage).where(and_(EmailMessage.id == message_id, EmailMessage.tenant_id == tenant_id, EmailMessage.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Logs ──

async def get_email_logs(
    session: AsyncSession, tenant_id: uuid.UUID, message_id: uuid.UUID
) -> List[EmailLog]:
    result = await session.execute(
        select(EmailLog).where(and_(EmailLog.message_id == message_id, EmailLog.tenant_id == tenant_id, EmailLog.deleted_at.is_(None)))
        .order_by(EmailLog.logged_at.desc())
    )
    return list(result.scalars().all())


# ── Bounces ──

async def get_bounces(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[EmailBounce]:
    result = await session.execute(
        select(EmailBounce).where(and_(EmailBounce.tenant_id == tenant_id, EmailBounce.deleted_at.is_(None)))
        .order_by(EmailBounce.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())
