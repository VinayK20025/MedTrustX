"""
MedTrustX Simulation & What-If Engine Service — Domain Entities

Postgres abstractions for simulation models, scenarios, results, and events.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Simulation(BaseModel):
    """A named simulation run definition."""
    __tablename__ = "simulations"
    __table_args__ = (
        Index("ix_sim_tenant", "tenant_id", "name"),
        Index("ix_sim_status", "status"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)  # what_if, predictive, stress_test, policy_impact
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, running, completed, failed


class Scenario(BaseModel):
    """A parameter set defining one branch of a simulation."""
    __tablename__ = "scenarios"
    __table_args__ = (
        Index("ix_scenario_sim", "tenant_id", "simulation_id"),
    )

    simulation_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    parameters: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class SimulationResult(BaseModel):
    """Output of a completed simulation run."""
    __tablename__ = "simulation_results"
    __table_args__ = (
        Index("ix_simresult_sim", "tenant_id", "simulation_id"),
    )

    simulation_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    result: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False
    )


class SimulationEvent(BaseModel):
    """Lifecycle events emitted during simulation execution."""
    __tablename__ = "simulation_events"
    __table_args__ = (
        Index("ix_simevent_sim", "tenant_id", "simulation_id"),
        Index("ix_simevent_type", "event_type"),
    )

    simulation_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
