"""
MedTrustX Diagnostics Service — Imaging Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.diagnostics import ImagingResultCreate, ImagingResultResponse
from src.services import diagnostics_service

router = APIRouter(prefix="/orders/{order_id}/imaging", tags=["Imaging"])

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
    response_model=ImagingResultResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add imaging result / report",
)
async def add_imaging_result(
    order_id: uuid.UUID,
    data: ImagingResultCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    res = await diagnostics_service.add_imaging_result(session, tenant_id, order_id, data)
    if not res:
        raise HTTPException(status_code=404, detail="Order not found")
    await session.commit()
    return res
