"""
MedTrustX Care Coordination Service — Plans Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.coordination import CarePlanCreate, CarePlanResponse, CarePlanUpdate
from src.services import coordination_service

router = APIRouter(prefix="/care-plans", tags=["Care Plans"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=CarePlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Initialize a new care journey/plan for a patient",
)
async def create_plan(
    data: CarePlanCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    plan = await coordination_service.create_care_plan(session, tenant_id, data)
    await session.commit()
    return plan

@router.get(
    "/{plan_id}",
    response_model=CarePlanResponse,
    summary="Fetch a specific care plan",
)
async def get_plan(
    plan_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    plan = await coordination_service.get_care_plan(session, tenant_id, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Care plan not found")
    return plan

@router.put(
    "/{plan_id}",
    response_model=CarePlanResponse,
    summary="Update the status of a care plan",
)
async def update_plan(
    plan_id: uuid.UUID,
    data: CarePlanUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    plan = await coordination_service.update_care_plan(session, tenant_id, plan_id, data)
    if not plan:
        raise HTTPException(status_code=404, detail="Care plan not found")
    await session.commit()
    return plan

@router.get(
    "/patient/{patient_id}",
    response_model=List[CarePlanResponse],
    summary="List all care plans for a specific patient",
)
async def get_patient_plans(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await coordination_service.get_patient_care_plans(session, tenant_id, patient_id)
