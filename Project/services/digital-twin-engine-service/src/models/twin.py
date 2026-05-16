"""
MedTrustX Digital Twin Engine Service — Domain Entities

Postgres abstractions for digital twin state modelling and simulation.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class DigitalTwin(BaseModel):
    """A virtual representation of a physical entity (device, room, system)."""
    __tablename__ = "digital_twins"
    __table_args__ = (
        Index("ix_twin_entity", "tenant_id", "entity_id"),
    )

    entity_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)  # ventilator, icu_bed, infusion_pump, facility_hvac
    state: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class TwinState(BaseModel):
    """Immutable snapshot of a twin's state at a point in time."""
    __tablename__ = "twin_states"
    __table_args__ = (
        Index("ix_twin_state_twin", "tenant_id", "twin_id"),
    )

    twin_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    state: Mapped[dict] = mapped_column(JSONB, nullable=False)


class TwinEvent(BaseModel):
    """Domain events associated with a twin lifecycle."""
    __tablename__ = "twin_events"
    __table_args__ = (
        Index("ix_twin_event_twin", "tenant_id", "twin_id"),
        Index("ix_twin_event_type", "event_type"),
    )

    twin_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class TwinSimulation(BaseModel):
    """Simulation run record for predictive modelling."""
    __tablename__ = "twin_simulations"
    __table_args__ = (
        Index("ix_twin_sim_twin", "tenant_id", "twin_id"),
    )

    twin_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    simulation_type: Mapped[str] = mapped_column(String(100), nullable=False)  # predictive, stress_test, what_if
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, running, completed, failed
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
