"""
MedTrustX API Composition Gateway Service — Business Logic Layer
"""
import time
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.composition import ApiComposition, CompositionLog, CompositionRoute
from src.schemas.composition import CompositionCreate, ComposeRequest, ComposeResponse
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Compositions ──

async def create_composition(session: AsyncSession, tenant_id: uuid.UUID, data: CompositionCreate) -> ApiComposition:
    comp = ApiComposition(tenant_id=tenant_id, name=data.name, definition=data.definition)
    session.add(comp)
    await session.flush()
    return comp


async def get_composition(session: AsyncSession, tenant_id: uuid.UUID, comp_id: uuid.UUID) -> ApiComposition | None:
    result = await session.execute(select(ApiComposition).where(and_(ApiComposition.id == comp_id, ApiComposition.tenant_id == tenant_id, ApiComposition.deleted_at.is_(None))))
    return result.scalar_one_or_none()


# ── Composition Execution ──

async def execute_composition(session: AsyncSession, tenant_id: uuid.UUID, data: ComposeRequest) -> ComposeResponse:
    start = time.perf_counter()
    comp = await get_composition(session, tenant_id, data.composition_id)
    if not comp:
        raise ValueError("Composition not found")

    # Simulate dynamic API orchestration and backend fetching
    # Real implementation would parse comp.definition and dispatch concurrent httpx requests
    simulated_data = {"aggregated_view": "simulated", "sources": list(comp.definition.get("services", [])), "payload_received": data.payload}
    
    elapsed = int((time.perf_counter() - start) * 1000)
    status = "success"

    log_entry = CompositionLog(tenant_id=tenant_id, composition_id=comp.id, status=status, response_time=elapsed)
    session.add(log_entry)
    await session.flush()

    await publish_event("COMPOSITION_EXECUTED", tenant_id, comp.id, {"response_time": elapsed, "status": status})
    await publish_event("RESPONSE_RETURNED", tenant_id, comp.id, {"size": len(str(simulated_data))})

    return ComposeResponse(composition_id=comp.id, status=status, data=simulated_data, response_time=elapsed)


# ── Routes & Logs ──

async def list_routes(session: AsyncSession, tenant_id: uuid.UUID) -> List[CompositionRoute]:
    result = await session.execute(select(CompositionRoute).where(and_(CompositionRoute.tenant_id == tenant_id, CompositionRoute.deleted_at.is_(None))))
    return list(result.scalars().all())


async def list_logs(session: AsyncSession, tenant_id: uuid.UUID) -> List[CompositionLog]:
    result = await session.execute(select(CompositionLog).where(and_(CompositionLog.tenant_id == tenant_id, CompositionLog.deleted_at.is_(None))).order_by(CompositionLog.created_at.desc()).limit(100))
    return list(result.scalars().all())
