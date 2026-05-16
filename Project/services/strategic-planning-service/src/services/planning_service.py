"""
MedTrustX Strategic Planning Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.planning import Forecast, Initiative, Objective, StrategicPlan
from src.schemas.planning import InitiativeCreate, ObjectiveCreate, PlanCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def create_plan(session: AsyncSession, tenant_id: uuid.UUID, data: PlanCreate) -> StrategicPlan:
    plan = StrategicPlan(tenant_id=tenant_id, name=data.name, horizon=data.horizon)
    session.add(plan)
    await session.flush()
    await publish_event("PLAN_CREATED", tenant_id, plan.id, {"name": data.name, "horizon": data.horizon})
    return plan


async def get_plan(session: AsyncSession, tenant_id: uuid.UUID, plan_id: uuid.UUID) -> StrategicPlan | None:
    result = await session.execute(
        select(StrategicPlan).where(
            and_(StrategicPlan.id == plan_id, StrategicPlan.tenant_id == tenant_id, StrategicPlan.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def create_objective(session: AsyncSession, tenant_id: uuid.UUID, data: ObjectiveCreate) -> Objective:
    obj = Objective(tenant_id=tenant_id, plan_id=data.plan_id, objective_name=data.objective_name, target_value=data.target_value)
    session.add(obj)
    await session.flush()
    await publish_event("OBJECTIVE_UPDATED", tenant_id, obj.id, {"plan_id": str(data.plan_id), "objective": data.objective_name})
    return obj


async def create_initiative(session: AsyncSession, tenant_id: uuid.UUID, data: InitiativeCreate) -> Initiative:
    init = Initiative(tenant_id=tenant_id, plan_id=data.plan_id, initiative_name=data.initiative_name)
    session.add(init)
    await session.flush()
    return init


async def list_forecasts(session: AsyncSession, tenant_id: uuid.UUID) -> List[Forecast]:
    result = await session.execute(
        select(Forecast).where(
            and_(Forecast.tenant_id == tenant_id, Forecast.deleted_at.is_(None))
        ).order_by(Forecast.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
