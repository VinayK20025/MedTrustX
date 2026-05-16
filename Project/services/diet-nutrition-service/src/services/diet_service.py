"""
MedTrustX Diet & Nutrition Service — Business Logic Layer

Diet plans, nutrition profiles, meal orders, and events.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.diet import (
    DietEvent,
    DietPlan,
    MealOrder,
    NutritionProfile,
)
from src.schemas.diet import (
    DietEventCreate,
    DietPlanCreate,
    MealOrderCreate,
    NutritionProfileCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Diet Plans ──

async def create_diet_plan(
    session: AsyncSession, tenant_id: uuid.UUID, data: DietPlanCreate
) -> DietPlan:
    plan = DietPlan(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        diet_type=data.diet_type,
        restrictions=data.restrictions,
    )
    session.add(plan)
    await session.flush()
    await publish_event("DIET_PLAN_CREATED", tenant_id, plan.id, {"patient_id": str(data.patient_id), "diet_type": data.diet_type})
    return plan


async def get_diet_plan(
    session: AsyncSession, tenant_id: uuid.UUID, patient_id: uuid.UUID
) -> Optional[DietPlan]:
    result = await session.execute(
        select(DietPlan).where(
            and_(DietPlan.patient_id == patient_id, DietPlan.tenant_id == tenant_id, DietPlan.deleted_at.is_(None))
        ).order_by(DietPlan.created_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()


# ── Nutrition Profiles ──

async def upsert_nutrition_profile(
    session: AsyncSession, tenant_id: uuid.UUID, data: NutritionProfileCreate
) -> NutritionProfile:
    # Check existing
    result = await session.execute(
        select(NutritionProfile).where(
            and_(NutritionProfile.patient_id == data.patient_id, NutritionProfile.tenant_id == tenant_id, NutritionProfile.deleted_at.is_(None))
        )
    )
    profile = result.scalar_one_or_none()

    if profile:
        profile.bmi = data.bmi
        profile.caloric_needs = data.caloric_needs
        profile.allergies = data.allergies
    else:
        profile = NutritionProfile(
            tenant_id=tenant_id,
            patient_id=data.patient_id,
            bmi=data.bmi,
            caloric_needs=data.caloric_needs,
            allergies=data.allergies,
        )
        session.add(profile)

    await session.flush()
    return profile


async def get_nutrition_profile(
    session: AsyncSession, tenant_id: uuid.UUID, patient_id: uuid.UUID
) -> Optional[NutritionProfile]:
    result = await session.execute(
        select(NutritionProfile).where(
            and_(NutritionProfile.patient_id == patient_id, NutritionProfile.tenant_id == tenant_id, NutritionProfile.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Meal Orders ──

async def place_meal_order(
    session: AsyncSession, tenant_id: uuid.UUID, data: MealOrderCreate
) -> MealOrder:
    order = MealOrder(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        meal_type=data.meal_type,
        scheduled_at=data.scheduled_at,
    )
    session.add(order)
    await session.flush()
    await publish_event("MEAL_ORDER_PLACED", tenant_id, order.id, {"patient_id": str(data.patient_id), "meal_type": data.meal_type})
    return order


async def get_meal_order(
    session: AsyncSession, tenant_id: uuid.UUID, order_id: uuid.UUID
) -> Optional[MealOrder]:
    result = await session.execute(
        select(MealOrder).where(and_(MealOrder.id == order_id, MealOrder.tenant_id == tenant_id, MealOrder.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


async def get_patient_meal_schedule(
    session: AsyncSession, tenant_id: uuid.UUID, patient_id: uuid.UUID
) -> List[MealOrder]:
    result = await session.execute(
        select(MealOrder).where(and_(MealOrder.patient_id == patient_id, MealOrder.tenant_id == tenant_id, MealOrder.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Diet Events ──

async def log_diet_event(
    session: AsyncSession, tenant_id: uuid.UUID, data: DietEventCreate
) -> DietEvent:
    event = DietEvent(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        event_type=data.event_type,
        payload=data.payload,
    )
    session.add(event)
    await session.flush()
    return event
