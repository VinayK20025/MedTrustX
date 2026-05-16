"""
MedTrustX Redpanda Console Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.console import (
    ConsumerGroupDetail, ConsumerGroupSummary, TopicMessageResponse, TopicSummary
)
from src.services import console_service

router = APIRouter(tags=["Redpanda Console Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Topics ──

@router.get("/topics", response_model=List[TopicSummary])
async def list_topics(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await console_service.list_topics(session, tid)


@router.get("/topics/{name}/messages", response_model=List[TopicMessageResponse])
async def get_topic_messages(name: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    messages = await console_service.get_topic_messages(session, tid, name)
    await session.commit()
    return messages


# ── Consumer Groups ──

@router.get("/consumer-groups", response_model=List[ConsumerGroupSummary])
async def list_consumer_groups(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await console_service.list_consumer_groups(session, tid)


@router.get("/consumer-groups/{name}", response_model=ConsumerGroupDetail)
async def get_consumer_group(name: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    group = await console_service.get_consumer_group(session, tid, name)
    if not group:
        raise HTTPException(status_code=404, detail="Consumer group not found")
    await session.commit()
    return group
