"""
MedTrustX ICU Service — Critical Alerts Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.icu import ICUAlertCreate, ICUAlertResponse
from src.services import icu_service

router = APIRouter(tags=["Alerts"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/icu/alerts",
    response_model=ICUAlertResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger a new critical ICU alert",
)
async def trigger_alert(
    data: ICUAlertCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    alert = await icu_service.trigger_alert(session, tenant_id, data)
    await session.commit()
    return alert

@router.post(
    "/icu/alerts/{alert_id}/resolve",
    response_model=ICUAlertResponse,
    summary="Acknowledge and resolve a critical alert",
)
async def resolve_alert(
    alert_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    alert = await icu_service.resolve_alert(session, tenant_id, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await session.commit()
    return alert

@router.get(
    "/icu/patients/{patient_id}/alerts",
    response_model=List[ICUAlertResponse],
    summary="Get active critical alerts for an ICU patient",
)
async def get_patient_alerts(
    patient_id: uuid.UUID,
    request: Request,
    active_only: bool = True,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await icu_service.get_patient_alerts(session, tenant_id, patient_id, active_only)
