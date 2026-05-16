"""
MedTrustX Postal Mail Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.postal import (
    EmailBounceResponse, EmailLogResponse,
    EmailMessageCreate, EmailMessageResponse
)
from src.services import postal_service

router = APIRouter(tags=["Postal Mail Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Emails ──

@router.post("/emails/send", response_model=EmailMessageResponse, status_code=status.HTTP_201_CREATED)
async def queue_email(data: EmailMessageCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    message = await postal_service.queue_email(session, tid, data)
    await session.commit()
    return message


@router.get("/emails/{message_id}", response_model=EmailMessageResponse)
async def get_email(message_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    message = await postal_service.get_email(session, tid, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Email message not found")
    return message


# ── Logs & Bounces ──

@router.get("/emails/{message_id}/logs", response_model=List[EmailLogResponse])
async def get_email_logs(message_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await postal_service.get_email_logs(session, tid, message_id)


@router.get("/emails/bounces/all", response_model=List[EmailBounceResponse])
async def get_bounces(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await postal_service.get_bounces(session, tid)
