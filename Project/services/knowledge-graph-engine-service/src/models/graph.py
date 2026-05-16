"""
MedTrustX Knowledge Graph Engine Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, Integer, String, text, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class GraphNode(BaseModel):
    """An entity within the knowledge graph (e.g., Patient, Device, Protocol)."""
    __tablename__ = "graph_nodes"
    __table_args__ = (
        Index("ix_graphnode_tenant_type", "tenant_id", "entity_type"),
    )
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    properties: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class GraphEdge(BaseModel):
    """A directed relationship between two nodes in the knowledge graph."""
    __tablename__ = "graph_edges"
    __table_args__ = (
        Index("ix_graphedge_source_target", "tenant_id", "source_node", "target_node"),
        Index("ix_graphedge_type", "relation_type"),
    )
    source_node: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    target_node: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    relation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    properties: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class GraphQuery(BaseModel):
    """Log of complex graph traversals and queries executed."""
    __tablename__ = "graph_queries"
    query: Mapped[str] = mapped_column(Text, nullable=False)
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    result_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

class InferenceResult(BaseModel):
    """Relationships inferred by AI reasoning over the graph structure."""
    __tablename__ = "inference_results"
    __table_args__ = (
        Index("ix_infer_node", "tenant_id", "node_id"),
    )
    node_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    inferred_relations: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
