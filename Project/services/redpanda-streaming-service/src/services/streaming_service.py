"""
MedTrustX Redpanda Streaming Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.redpanda import ConsumerOffset, StreamMessage, StreamTopic
from src.schemas.redpanda import (
    ConsumerOffsetResponse, ProduceMessageRequest, ProduceMessageResponse, TopicCreate
)
from src.services.event_publisher import _producer, publish_event

logger = structlog.get_logger()


# ── Topics ──

async def create_topic(
    session: AsyncSession, tenant_id: uuid.UUID, data: TopicCreate
) -> StreamTopic:
    # Check if exists
    result = await session.execute(
        select(StreamTopic).where(and_(StreamTopic.topic_name == data.topic_name, StreamTopic.tenant_id == tenant_id, StreamTopic.deleted_at.is_(None)))
    )
    if result.scalar_one_or_none():
        raise ValueError("Topic already exists")

    topic = StreamTopic(
        tenant_id=tenant_id,
        topic_name=data.topic_name,
        partitions=data.partitions,
        replication_factor=data.replication_factor,
    )
    session.add(topic)
    await session.flush()
    await publish_event("TOPIC_CREATED", tenant_id, topic.id, {"topic": data.topic_name})
    return topic


async def list_topics(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[StreamTopic]:
    result = await session.execute(
        select(StreamTopic).where(and_(StreamTopic.tenant_id == tenant_id, StreamTopic.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Production ──

async def produce_message(
    session: AsyncSession, tenant_id: uuid.UUID, data: ProduceMessageRequest
) -> ProduceMessageResponse:
    # Determine offset (mock for abstraction, but in a real system Kafka returns it)
    # Using an auto-incrementing pattern in DB for this tier-0 abstraction
    # In reality, _producer.send_and_wait would be invoked with the specific topic here.
    
    mock_partition = data.partition or 0
    mock_offset = int(datetime.now().timestamp() * 1000)

    msg = StreamMessage(
        tenant_id=tenant_id,
        topic=data.topic,
        key=data.key,
        value=data.value,
        partition=mock_partition,
        offset=mock_offset
    )
    session.add(msg)
    await session.flush()
    
    await publish_event("STREAM_EVENT_PERSISTED", tenant_id, msg.id, {"topic": data.topic, "offset": mock_offset})

    return ProduceMessageResponse(
        status="persisted",
        topic=data.topic,
        partition=mock_partition,
        offset=mock_offset,
        timestamp=datetime.now(timezone.utc)
    )


# ── Consumer Groups ──

async def get_consumer_offsets(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[ConsumerOffset]:
    result = await session.execute(
        select(ConsumerOffset).where(and_(ConsumerOffset.tenant_id == tenant_id, ConsumerOffset.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
