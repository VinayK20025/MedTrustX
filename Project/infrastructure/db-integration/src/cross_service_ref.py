"""
MedTrustX DB Integration — Cross-Service Data References (§7)

STRICT RULE: Services NEVER join across databases.

Instead, they maintain local reference tables populated via events.

Example Flow:
  PATIENT_CREATED event → clinical-service → stores patient_id in patient_refs

This module provides:
- Reference table model
- Event-driven sync utilities
- Lookup helpers
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Index, String, text, select
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
import structlog

logger = structlog.get_logger()


class RefBase(DeclarativeBase):
    """Separate declarative base for cross-service reference tables."""
    pass


class CrossServiceRef(RefBase):
    """
    §7 — Local reference to an entity owned by another service.

    Every service that needs data from another service maintains
    its own copy of the foreign entity's ID + minimal metadata.
    """
    __tablename__ = "cross_service_refs"
    __table_args__ = (
        Index("ix_ref_tenant_source", "tenant_id", "source_service"),
        Index("ix_ref_entity", "entity_type", "entity_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    source_service: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "patient-service"
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)     # e.g. "Patient"
    entity_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    display_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


async def sync_reference(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    source_service: str,
    entity_type: str,
    entity_id: uuid.UUID,
    display_name: Optional[str] = None,
) -> CrossServiceRef:
    """
    §7 — Upsert a cross-service reference from an incoming event.

    Called from Kafka consumer handlers when receiving events
    like PATIENT_CREATED, ENCOUNTER_STARTED, etc.
    """
    # Check if reference already exists
    result = await session.execute(
        select(CrossServiceRef).where(
            CrossServiceRef.tenant_id == tenant_id,
            CrossServiceRef.source_service == source_service,
            CrossServiceRef.entity_type == entity_type,
            CrossServiceRef.entity_id == entity_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.display_name = display_name
        existing.synced_at = datetime.now(timezone.utc)
        await session.flush()
        return existing

    ref = CrossServiceRef(
        tenant_id=tenant_id,
        source_service=source_service,
        entity_type=entity_type,
        entity_id=entity_id,
        display_name=display_name,
    )
    session.add(ref)
    await session.flush()
    logger.debug("cross_ref_synced", source=source_service, entity=entity_type, entity_id=str(entity_id))
    return ref


async def lookup_reference(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    entity_type: str,
    entity_id: uuid.UUID,
) -> Optional[CrossServiceRef]:
    """Look up a cross-service reference by entity type and ID."""
    result = await session.execute(
        select(CrossServiceRef).where(
            CrossServiceRef.tenant_id == tenant_id,
            CrossServiceRef.entity_type == entity_type,
            CrossServiceRef.entity_id == entity_id,
        )
    )
    return result.scalar_one_or_none()
