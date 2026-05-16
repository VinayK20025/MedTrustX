"""
MedTrustX Redpanda Streaming Service — Domain Entities

Metadata tracking for topics, streams, and consumer offsets.
"""
from datetime import datetime, timezone

from sqlalchemy import BigInteger, DateTime, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class StreamTopic(BaseModel):
    """Metadata for registered Redpanda topics."""
    __tablename__ = "stream_topics"
    __table_args__ = (
        Index("ix_redpanda_topic_name", "tenant_id", "topic_name"),
    )

    topic_name: Mapped[str] = mapped_column(String(255), nullable=False)
    partitions: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    replication_factor: Mapped[int] = mapped_column(Integer, nullable=False, default=1)


class StreamMessage(BaseModel):
    """Fallback persistence or durable log for a streaming message."""
    __tablename__ = "stream_messages"
    __table_args__ = (
        Index("ix_redpanda_msg_topic", "tenant_id", "topic"),
        Index("ix_redpanda_msg_offset", "tenant_id", "topic", "partition", "offset"),
    )

    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    partition: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    offset: Mapped[int] = mapped_column(BigInteger, nullable=False)


class ConsumerOffset(BaseModel):
    """Tracking consumer group offsets for specific topics/partitions."""
    __tablename__ = "consumer_offsets"
    __table_args__ = (
        Index("ix_redpanda_offset_group", "tenant_id", "consumer_group", "topic", "partition"),
    )

    consumer_group: Mapped[str] = mapped_column(String(255), nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    partition: Mapped[int] = mapped_column(Integer, nullable=False)
    offset: Mapped[int] = mapped_column(BigInteger, nullable=False)
