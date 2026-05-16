"""
MedTrustX Data Fabric / Integration Hub Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel


class DataPipeline(BaseModel):
    """An ETL/ELT pipeline definition connecting a source to a destination."""
    __tablename__ = "data_pipelines"
    __table_args__ = (
        Index("ix_pipeline_tenant_status", "tenant_id", "status"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="idle")  # idle, running, completed, failed


class Transformation(BaseModel):
    """Schema mapping and transformation rules for a pipeline."""
    __tablename__ = "transformations"
    __table_args__ = (
        Index("ix_transform_pipeline", "tenant_id", "pipeline_id"),
    )
    pipeline_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    mapping: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class IntegrationEvent(BaseModel):
    """Lifecycle events emitted during pipeline execution."""
    __tablename__ = "integration_events"
    __table_args__ = (
        Index("ix_intevent_pipeline", "tenant_id", "pipeline_id"),
        Index("ix_intevent_type", "event_type"),
    )
    pipeline_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class SchemaRegistry(BaseModel):
    """Versioned schema definitions for data normalization."""
    __tablename__ = "schema_registry"
    __table_args__ = (
        Index("ix_schema_name", "tenant_id", "schema_name"),
    )
    schema_name: Mapped[str] = mapped_column(String(255), nullable=False)
    definition: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
