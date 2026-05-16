"""
MedTrustX Digital Twin Engine Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.twin import DigitalTwin, TwinEvent, TwinSimulation, TwinState
from src.schemas.twin import (
    SimulationRequest, StateUpdateRequest, TwinCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Twin Lifecycle ──

async def create_twin(
    session: AsyncSession, tenant_id: uuid.UUID, data: TwinCreate
) -> DigitalTwin:
    twin = DigitalTwin(
        tenant_id=tenant_id,
        entity_id=data.entity_id,
        type=data.type,
        state=data.state
    )
    session.add(twin)
    await session.flush()

    # Record creation event
    event = TwinEvent(
        tenant_id=tenant_id, twin_id=twin.id,
        event_type="TWIN_CREATED", payload={"type": data.type, "entity_id": str(data.entity_id)}
    )
    session.add(event)
    await session.flush()

    await publish_event("TWIN_CREATED", tenant_id, twin.id, {"type": data.type})
    return twin


async def get_twin(
    session: AsyncSession, tenant_id: uuid.UUID, twin_id: uuid.UUID
) -> DigitalTwin | None:
    result = await session.execute(
        select(DigitalTwin).where(
            and_(DigitalTwin.id == twin_id, DigitalTwin.tenant_id == tenant_id, DigitalTwin.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── State Synchronization ──

async def update_state(
    session: AsyncSession, tenant_id: uuid.UUID, twin_id: uuid.UUID, data: StateUpdateRequest
) -> TwinState:
    # 1. Update the twin's live state
    twin = await get_twin(session, tenant_id, twin_id)
    if twin:
        twin.state = {**twin.state, **data.state}

    # 2. Append immutable state snapshot
    snapshot = TwinState(tenant_id=tenant_id, twin_id=twin_id, state=data.state)
    session.add(snapshot)

    # 3. Record state update event
    event = TwinEvent(
        tenant_id=tenant_id, twin_id=twin_id,
        event_type="STATE_UPDATED", payload=data.state
    )
    session.add(event)
    await session.flush()

    await publish_event("STATE_UPDATED", tenant_id, twin_id, {"state_keys": list(data.state.keys())})
    return snapshot


# ── Simulations ──

async def run_simulation(
    session: AsyncSession, tenant_id: uuid.UUID, twin_id: uuid.UUID, data: SimulationRequest
) -> TwinSimulation:
    simulation = TwinSimulation(
        tenant_id=tenant_id,
        twin_id=twin_id,
        simulation_type=data.simulation_type,
        status="completed",  # Simulated instant completion
        started_at=datetime.now(timezone.utc)
    )
    session.add(simulation)

    event = TwinEvent(
        tenant_id=tenant_id, twin_id=twin_id,
        event_type="SIMULATION_COMPLETED",
        payload={"simulation_type": data.simulation_type, "status": "completed"}
    )
    session.add(event)
    await session.flush()

    await publish_event("SIMULATION_COMPLETED", tenant_id, simulation.id, {"type": data.simulation_type})
    return simulation


# ── Events ──

async def get_twin_events(
    session: AsyncSession, tenant_id: uuid.UUID, twin_id: uuid.UUID
) -> List[TwinEvent]:
    result = await session.execute(
        select(TwinEvent).where(
            and_(TwinEvent.tenant_id == tenant_id, TwinEvent.twin_id == twin_id, TwinEvent.deleted_at.is_(None))
        ).order_by(TwinEvent.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
