"""
MedTrustX CDSS Service — Alerts Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.cdss import CDSSAlertCreate, CDSSAlertResponse
from src.services import cdss_service

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
    "/cdss/alerts",
    response_model=CDSSAlertResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger a clinical warning (usually called internally by evaluation engine)",
)
async def trigger_alert(
    data: CDSSAlertCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    alert = await cdss_service.trigger_alert(session, tenant_id, data)
    await session.commit()
    return alert

@router.get(
    "/patients/{patient_id}/cdss/alerts",
    response_model=List[CDSSAlertResponse],
    summary="Get active and historical CDSS alerts for a patient",
)
async def get_patient_alerts(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await cdss_service.get_patient_alerts(session, tenant_id, patient_id)

@router.post(
    "/cdss/alerts/{alert_id}/resolve",
    response_model=CDSSAlertResponse,
    summary="Acknowledge or resolve a CDSS alert",
)
async def resolve_alert(
    alert_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    alert = await cdss_service.resolve_alert(session, tenant_id, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await session.commit()
    return alert
