"""
MedTrustX Redpanda Console Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, List

from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.console import ConsumerGroupView, TopicView
from src.schemas.console import (
    ConsumerGroupDetail, ConsumerGroupSummary, TopicMessageResponse, TopicSummary
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# Simulated topic registry — in production, this queries Redpanda Admin API
_SIMULATED_TOPICS: Dict[str, dict] = {
    "medtrust.patient.events": {"partitions": 6, "messages": 142000},
    "medtrust.clinical.events": {"partitions": 4, "messages": 89000},
    "medtrust.monitoring.events": {"partitions": 3, "messages": 210000},
    "medtrust.logging.events": {"partitions": 3, "messages": 560000},
    "medtrust.tracing.events": {"partitions": 3, "messages": 310000},
    "medtrust.quality.events": {"partitions": 2, "messages": 12000},
    "medtrust.sourcecontrol.events": {"partitions": 2, "messages": 8500},
    "medtrust.console.events": {"partitions": 1, "messages": 3200},
}

_SIMULATED_CONSUMER_GROUPS: Dict[str, dict] = {
    "analytics-consumer": {"members": 3, "lag": 120, "topics": ["medtrust.patient.events", "medtrust.clinical.events"], "state": "stable"},
    "monitoring-consumer": {"members": 2, "lag": 45, "topics": ["medtrust.monitoring.events"], "state": "stable"},
    "logging-consumer": {"members": 4, "lag": 890, "topics": ["medtrust.logging.events"], "state": "rebalancing"},
}


# ── Topics ──

async def list_topics(session: AsyncSession, tenant_id: uuid.UUID) -> List[TopicSummary]:
    await publish_event("CONSOLE_ACCESSED", tenant_id, payload={"action": "list_topics"})
    return [
        TopicSummary(topic_name=name, partition_count=meta["partitions"], message_count=meta["messages"])
        for name, meta in _SIMULATED_TOPICS.items()
    ]


async def get_topic_messages(
    session: AsyncSession, tenant_id: uuid.UUID, topic_name: str
) -> List[TopicMessageResponse]:
    # Audit the topic view
    view = TopicView(tenant_id=tenant_id, topic_name=topic_name, accessed_at=datetime.now(timezone.utc))
    session.add(view)
    await session.flush()

    await publish_event("TOPIC_VIEWED", tenant_id, view.id, {"topic": topic_name})

    # Simulated latest messages
    return [
        TopicMessageResponse(
            topic_name=topic_name, partition=0, offset=i,
            key=f"tenant_{tenant_id}", value={"event": "simulated", "seq": i},
            timestamp=datetime.now(timezone.utc)
        ) for i in range(5)
    ]


# ── Consumer Groups ──

async def list_consumer_groups(session: AsyncSession, tenant_id: uuid.UUID) -> List[ConsumerGroupSummary]:
    return [
        ConsumerGroupSummary(group_name=name, member_count=meta["members"], total_lag=meta["lag"])
        for name, meta in _SIMULATED_CONSUMER_GROUPS.items()
    ]


async def get_consumer_group(
    session: AsyncSession, tenant_id: uuid.UUID, group_name: str
) -> ConsumerGroupDetail | None:
    meta = _SIMULATED_CONSUMER_GROUPS.get(group_name)
    if not meta:
        return None

    # Audit the consumer group view
    view = ConsumerGroupView(
        tenant_id=tenant_id, group_name=group_name,
        lag=meta["lag"], checked_at=datetime.now(timezone.utc)
    )
    session.add(view)
    await session.flush()

    await publish_event("CONSUMER_LAG_CHECKED", tenant_id, view.id, {"group": group_name, "lag": meta["lag"]})

    return ConsumerGroupDetail(
        group_name=group_name, member_count=meta["members"],
        total_lag=meta["lag"], topics=meta["topics"], state=meta["state"]
    )
