"""
MedTrustX Diet & Nutrition Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.diet import (
    DietEventCreate, DietEventResponse,
    DietPlanCreate, DietPlanResponse,
    MealOrderCreate, MealOrderResponse,
    NutritionProfileCreate, NutritionProfileResponse
)
from src.services import diet_service

router = APIRouter(tags=["Diet & Nutrition Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Diet Plans ──

@router.post("/diet-plans", response_model=DietPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_diet_plan(data: DietPlanCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    plan = await diet_service.create_diet_plan(session, tid, data)
    await session.commit()
    return plan

@router.get("/diet-plans/{patient_id}", response_model=DietPlanResponse)
async def get_diet_plan(patient_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    plan = await diet_service.get_diet_plan(session, tid, patient_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Diet plan not found")
    return plan


# ── Nutrition Profiles ──

@router.post("/nutrition-profiles", response_model=NutritionProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_nutrition_profile(data: NutritionProfileCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    profile = await diet_service.upsert_nutrition_profile(session, tid, data)
    await session.commit()
    return profile

@router.get("/nutrition-profiles/{patient_id}", response_model=NutritionProfileResponse)
async def get_nutrition_profile(patient_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    profile = await diet_service.get_nutrition_profile(session, tid, patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Nutrition profile not found")
    return profile


# ── Meal Orders ──

@router.post("/meal-orders", response_model=MealOrderResponse, status_code=status.HTTP_201_CREATED)
async def place_meal_order(data: MealOrderCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    order = await diet_service.place_meal_order(session, tid, data)
    await session.commit()
    return order

@router.get("/meal-orders/{order_id}", response_model=MealOrderResponse)
async def get_meal_order(order_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    order = await diet_service.get_meal_order(session, tid, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Meal order not found")
    return order

@router.get("/meal-orders/{patient_id}/schedule", response_model=List[MealOrderResponse])
async def get_patient_meal_schedule(patient_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await diet_service.get_patient_meal_schedule(session, tid, patient_id)


# ── Diet Events ──

@router.post("/diet-events", response_model=DietEventResponse, status_code=status.HTTP_201_CREATED)
async def log_diet_event(data: DietEventCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    event = await diet_service.log_diet_event(session, tid, data)
    await session.commit()
    return event
