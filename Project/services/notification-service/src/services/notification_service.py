"""
MedTrustX Notification Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.notifications import (
    Notification, NotificationTemplate, NotificationLog, NotificationPreference, NotificationQueue
)
from src.schemas.notifications import (
    NotificationCreate, TemplateCreate, TemplateUpdate, PreferenceUpdate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Notifications ──

async def create_notification(
    session: AsyncSession, tenant_id: uuid.UUID, data: NotificationCreate
) -> Notification:
    notification = Notification(
        tenant_id=tenant_id,
        recipient_id=data.recipient_id,
        channel=data.channel,
        template_id=data.template_id,
        payload=data.payload,
        status="pending"
    )
    session.add(notification)
    await session.flush()

    # Create initial log
    log = NotificationLog(
        tenant_id=tenant_id,
        notification_id=notification.id,
        status="pending",
        response="Notification created",
    )
    session.add(log)

    # Add to queue if scheduled
    queue_item = NotificationQueue(
        tenant_id=tenant_id,
        notification_id=notification.id,
        status="queued",
        scheduled_at=data.scheduled_at or datetime.now(timezone.utc)
    )
    session.add(queue_item)
    await session.flush()

    await publish_event("NOTIFICATION_QUEUED", tenant_id, notification.id, {
        "notification_id": str(notification.id),
        "recipient_id": str(notification.recipient_id),
        "channel": notification.channel,
    })
    return notification

async def get_notification(
    session: AsyncSession, tenant_id: uuid.UUID, notification_id: uuid.UUID
) -> Optional[Notification]:
    result = await session.execute(
        select(Notification)
        .options(selectinload(Notification.logs))
        .where(and_(Notification.id == notification_id, Notification.tenant_id == tenant_id, Notification.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def retry_notification(
    session: AsyncSession, tenant_id: uuid.UUID, notification_id: uuid.UUID
) -> Optional[Notification]:
    notification = await get_notification(session, tenant_id, notification_id)
    if not notification:
        return None
    
    notification.status = "pending"
    notification.updated_at = datetime.now(timezone.utc)

    log = NotificationLog(
        tenant_id=tenant_id,
        notification_id=notification.id,
        status="retrying",
        response="Manual retry requested",
    )
    session.add(log)

    queue_item = NotificationQueue(
        tenant_id=tenant_id,
        notification_id=notification.id,
        status="queued",
        scheduled_at=datetime.now(timezone.utc)
    )
    session.add(queue_item)
    await session.flush()

    await publish_event("NOTIFICATION_RETRIED", tenant_id, notification.id, {
        "notification_id": str(notification.id),
        "channel": notification.channel,
    })
    return notification

async def get_notification_logs(
    session: AsyncSession, tenant_id: uuid.UUID, notification_id: uuid.UUID
) -> List[NotificationLog]:
    result = await session.execute(
        select(NotificationLog).where(and_(NotificationLog.tenant_id == tenant_id, NotificationLog.notification_id == notification_id, NotificationLog.deleted_at.is_(None))).order_by(NotificationLog.attempted_at.desc())
    )
    return list(result.scalars().all())

# ── Templates ──

async def create_template(
    session: AsyncSession, tenant_id: uuid.UUID, data: TemplateCreate
) -> NotificationTemplate:
    template = NotificationTemplate(
        tenant_id=tenant_id,
        name=data.name,
        channel=data.channel,
        content=data.content,
    )
    session.add(template)
    await session.flush()
    return template

async def get_template(
    session: AsyncSession, tenant_id: uuid.UUID, template_id: uuid.UUID
) -> Optional[NotificationTemplate]:
    result = await session.execute(
        select(NotificationTemplate).where(and_(NotificationTemplate.id == template_id, NotificationTemplate.tenant_id == tenant_id, NotificationTemplate.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_template(
    session: AsyncSession, tenant_id: uuid.UUID, template_id: uuid.UUID, data: TemplateUpdate
) -> Optional[NotificationTemplate]:
    template = await get_template(session, tenant_id, template_id)
    if not template:
        return None
    
    if data.name:
        template.name = data.name
    if data.channel:
        template.channel = data.channel
    if data.content:
        template.content = data.content
        
    template.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return template

# ── Preferences ──

async def get_preferences(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> List[NotificationPreference]:
    result = await session.execute(
        select(NotificationPreference).where(and_(NotificationPreference.tenant_id == tenant_id, NotificationPreference.user_id == user_id, NotificationPreference.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

async def update_preference(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID, data: PreferenceUpdate
) -> NotificationPreference:
    result = await session.execute(
        select(NotificationPreference).where(and_(NotificationPreference.tenant_id == tenant_id, NotificationPreference.user_id == user_id, NotificationPreference.channel == data.channel, NotificationPreference.deleted_at.is_(None)))
    )
    preference = result.scalar_one_or_none()
    
    if not preference:
        preference = NotificationPreference(
            tenant_id=tenant_id,
            user_id=user_id,
            channel=data.channel,
            enabled=data.enabled,
        )
        session.add(preference)
    else:
        preference.enabled = data.enabled
        preference.updated_at = datetime.now(timezone.utc)
        
    await session.flush()
    return preference
