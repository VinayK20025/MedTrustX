"""
MedTrustX Notification Service — Notifications Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.notifications import NotificationCreate, NotificationDetail, NotificationResponse, NotificationLogResponse
from src.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])

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
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new notification",
)
async def create_notification(
    data: NotificationCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    notification = await notification_service.create_notification(session, tenant_id, data)
    await session.commit()
    return notification

@router.get(
    "/{notification_id}",
    response_model=NotificationDetail,
    summary="Get notification details",
)
async def get_notification(
    notification_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    notification = await notification_service.get_notification(session, tenant_id, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.post(
    "/{notification_id}/retry",
    response_model=NotificationResponse,
    summary="Retry a failed notification",
)
async def retry_notification(
    notification_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    notification = await notification_service.retry_notification(session, tenant_id, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    await session.commit()
    return notification

@router.get(
    "/{notification_id}/logs",
    response_model=List[NotificationLogResponse],
    summary="Get notification logs",
)
async def get_notification_logs(
    notification_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await notification_service.get_notification_logs(session, tenant_id, notification_id)
