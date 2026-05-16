"""
MedTrustX Treatment Plan Service — Plans Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.treatment import (
    TreatmentPlanCreate,
    TreatmentPlanResponse,
    TreatmentPlanUpdate,
    TreatmentPlanVersionResponse,
)
from src.services import treatment_service

router = APIRouter(prefix="/treatment-plans", tags=["Treatment Plans"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "user_id", None)
    if raw is None:
        return uuid.uuid4() # Mock for local dev
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid4()

@router.post(
    "/",
    response_model=TreatmentPlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new medical treatment plan for a patient",
)
async def create_plan(
    data: TreatmentPlanCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    plan = await treatment_service.create_plan(session, tenant_id, user_id, data)
    await session.commit()
    return plan

@router.get(
    "/{plan_id}",
    response_model=TreatmentPlanResponse,
    summary="Fetch a specific treatment plan",
)
async def get_plan(
    plan_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    plan = await treatment_service.get_plan(session, tenant_id, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Treatment plan not found")
    return plan

@router.put(
    "/{plan_id}",
    response_model=TreatmentPlanResponse,
    summary="Update the overall status of a treatment plan",
)
async def update_plan(
    plan_id: uuid.UUID,
    data: TreatmentPlanUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    plan = await treatment_service.update_plan(session, tenant_id, plan_id, data)
    if not plan:
        raise HTTPException(status_code=404, detail="Treatment plan not found")
    await session.commit()
    return plan

@router.get(
    "/patient/{patient_id}",
    response_model=List[TreatmentPlanResponse],
    summary="List all treatment plans for a specific patient",
)
async def get_patient_plans(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await treatment_service.get_patient_plans(session, tenant_id, patient_id)

@router.get(
    "/{plan_id}/versions",
    response_model=List[TreatmentPlanVersionResponse],
    summary="Get the version history and audit log of a treatment plan",
)
async def get_plan_versions(
    plan_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await treatment_service.get_plan_versions(session, tenant_id, plan_id)
