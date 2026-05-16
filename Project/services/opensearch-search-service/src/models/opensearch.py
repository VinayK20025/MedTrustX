"""
MedTrustX OpenSearch Search Service — Domain Entities

Postgres abstractions for search indices and full-text document storage.
"""
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class SearchIndex(BaseModel):
    """Metadata for a distinct full-text searchable namespace."""
    __tablename__ = "search_indexes"
    __table_args__ = (
        Index("ix_opensearch_index_name", "tenant_id", "index_name"),
    )

    index_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mappings: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class IndexedDocument(BaseModel):
    """Fallback persistence for JSON documents pushed to OpenSearch."""
    __tablename__ = "indexed_documents"
    __table_args__ = (
        Index("ix_opensearch_doc_idx", "tenant_id", "index_name"),
        Index("ix_opensearch_doc_time", "created_at"),
    )

    index_name: Mapped[str] = mapped_column(String(255), nullable=False)
    document: Mapped[dict] = mapped_column(JSONB, nullable=False)


class SearchQuery(BaseModel):
    """Audit log tracking queries executed by users for analytics."""
    __tablename__ = "search_queries"
    __table_args__ = (
        Index("ix_opensearch_query", "tenant_id", "query"),
    )

    query: Mapped[str] = mapped_column(Text, nullable=False)
    result_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
