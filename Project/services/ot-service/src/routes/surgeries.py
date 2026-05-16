"""
MedTrustX OT Management Service — Surgery Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.ot import SurgeryCreate, SurgeryResponse, SurgeryUpdate
from src.services import ot_service

router = APIRouter(prefix="/surgeries", tags=["Surgeries"])

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
    response_model=SurgeryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule a new surgical procedure",
)
async def schedule_surgery(
    data: SurgeryCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    surgery = await ot_service.schedule_surgery(session, tenant_id, data)
    await session.commit()
    return surgery

@router.get(
    "/{surgery_id}",
    response_model=SurgeryResponse,
    summary="Get details of a scheduled surgery",
)
async def get_surgery(
    surgery_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    surgery = await ot_service.get_surgery(session, tenant_id, surgery_id)
    if not surgery:
        raise HTTPException(status_code=404, detail="Surgery not found")
    return surgery

@router.put(
    "/{surgery_id}",
    response_model=SurgeryResponse,
    summary="Update status of a surgery (e.g. mark in_progress or completed)",
)
async def update_surgery(
    surgery_id: uuid.UUID,
    data: SurgeryUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    surgery = await ot_service.update_surgery_status(session, tenant_id, surgery_id, data)
    if not surgery:
        raise HTTPException(status_code=404, detail="Surgery not found")
    await session.commit()
    return surgery

@router.post(
    "/{surgery_id}/start",
    response_model=SurgeryResponse,
    summary="Convenience endpoint to transition surgery to in_progress",
)
async def start_surgery(
    surgery_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    data = SurgeryUpdate(status="in_progress")
    surgery = await ot_service.update_surgery_status(session, tenant_id, surgery_id, data)
    if not surgery:
        raise HTTPException(status_code=404, detail="Surgery not found")
    await session.commit()
    return surgery

@router.post(
    "/{surgery_id}/complete",
    response_model=SurgeryResponse,
    summary="Convenience endpoint to mark surgery as completed and release rooms",
)
async def complete_surgery(
    surgery_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    data = SurgeryUpdate(status="completed")
    surgery = await ot_service.update_surgery_status(session, tenant_id, surgery_id, data)
    if not surgery:
        raise HTTPException(status_code=404, detail="Surgery not found")
    await session.commit()
    return surgery
