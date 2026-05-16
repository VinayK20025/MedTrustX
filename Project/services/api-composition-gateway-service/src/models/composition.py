"""
MedTrustX API Composition Gateway Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class ApiComposition(BaseModel):
    """Configuration for an orchestrated/composed API response."""
    __tablename__ = "api_compositions"
    __table_args__ = (
        Index("ix_apicomp_tenant_name", "tenant_id", "name"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    definition: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class CompositionLog(BaseModel):
    """Execution logs for composed API requests."""
    __tablename__ = "composition_logs"
    __table_args__ = (
        Index("ix_complog_comp", "tenant_id", "composition_id"),
        Index("ix_complog_status", "status"),
    )
    composition_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="success") # success, partial_success, failed
    response_time: Mapped[int] = mapped_column(Integer, nullable=False, default=0) # milliseconds

class CompositionRoute(BaseModel):
    """Route mapping for exposed compositions."""
    __tablename__ = "composition_routes"
    __table_args__ = (
        Index("ix_comproute_path", "tenant_id", "path"),
    )
    path: Mapped[str] = mapped_column(String(255), nullable=False)
    method: Mapped[str] = mapped_column(String(10), nullable=False, default="GET")
    composition_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
