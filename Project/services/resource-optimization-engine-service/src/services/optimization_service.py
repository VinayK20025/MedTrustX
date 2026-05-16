"""
MedTrustX Resource Optimization Engine Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.optimization import Allocation, OptimizationResult, OptimizationRun, Resource
from src.schemas.optimization import OptimizeRequest, ResourceCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Resources ──

async def create_resource(
    session: AsyncSession, tenant_id: uuid.UUID, data: ResourceCreate
) -> Resource:
    resource = Resource(
        tenant_id=tenant_id,
        resource_type=data.resource_type,
        status=data.status,
        metadata=data.metadata
    )
    session.add(resource)
    await session.flush()
    return resource


async def get_resource(
    session: AsyncSession, tenant_id: uuid.UUID, resource_id: uuid.UUID
) -> Resource | None:
    result = await session.execute(
        select(Resource).where(
            and_(Resource.id == resource_id, Resource.tenant_id == tenant_id, Resource.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Optimization ──

async def run_optimization(
    session: AsyncSession, tenant_id: uuid.UUID, data: OptimizeRequest
) -> OptimizationRun:
    now = datetime.now(timezone.utc)

    # 1. Create optimization run
    run = OptimizationRun(
        tenant_id=tenant_id,
        run_type=data.run_type,
        status="running",
        started_at=now
    )
    session.add(run)
    await session.flush()
    await publish_event("OPTIMIZATION_STARTED", tenant_id, run.id, {"run_type": data.run_type})

    # 2. Fetch available resources for optimization
    resources_result = await session.execute(
        select(Resource).where(
            and_(Resource.tenant_id == tenant_id, Resource.status == "available", Resource.deleted_at.is_(None))
        )
    )
    available = list(resources_result.scalars().all())

    # 3. Simulated optimization computation
    result_data = {
        "available_resources": len(available),
        "optimized_allocations": max(0, len(available) - 2),
        "utilization_improvement": 18.5,
        "cost_reduction_pct": 12.3,
        "recommendations": [
            f"Reallocate {len(available)} resources for better coverage",
            "Shift 2 resources from low-demand to high-demand zones"
        ],
        "constraints_satisfied": True,
    }

    opt_result = OptimizationResult(
        tenant_id=tenant_id, run_id=run.id, result=result_data
    )
    session.add(opt_result)

    # 4. Mark run as completed
    run.status = "completed"
    run.completed_at = datetime.now(timezone.utc)
    await session.flush()

    await publish_event("OPTIMIZATION_COMPLETED", tenant_id, run.id, result_data)
    return run


# ── Allocations ──

async def get_allocations(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[Allocation]:
    result = await session.execute(
        select(Allocation).where(
            and_(Allocation.tenant_id == tenant_id, Allocation.deleted_at.is_(None))
        ).order_by(Allocation.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())


# ── Results ──

async def get_optimization_run(
    session: AsyncSession, tenant_id: uuid.UUID, run_id: uuid.UUID
) -> OptimizationRun | None:
    result = await session.execute(
        select(OptimizationRun).where(
            and_(OptimizationRun.id == run_id, OptimizationRun.tenant_id == tenant_id)
        )
    )
    return result.scalar_one_or_none()
