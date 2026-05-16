"""
MedTrustX Redpanda Streaming Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.redpanda import (
    ConsumerOffsetResponse, ProduceMessageRequest, ProduceMessageResponse,
    TopicCreate, TopicResponse
)
from src.services import streaming_service

router = APIRouter(tags=["Redpanda Streaming Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Topics ──

@router.post("/topics", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
async def create_topic(data: TopicCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    try:
        topic = await streaming_service.create_topic(session, tid, data)
        await session.commit()
        return topic
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("/topics", response_model=List[TopicResponse])
async def list_topics(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await streaming_service.list_topics(session, tid)


# ── Production ──

@router.post("/produce", response_model=ProduceMessageResponse, status_code=status.HTTP_201_CREATED)
async def produce_message(data: ProduceMessageRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    result = await streaming_service.produce_message(session, tid, data)
    await session.commit()
    return result


# ── Consumers ──

@router.get("/consumer-groups", response_model=List[ConsumerOffsetResponse])
async def get_consumer_offsets(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await streaming_service.get_consumer_offsets(session, tid)
