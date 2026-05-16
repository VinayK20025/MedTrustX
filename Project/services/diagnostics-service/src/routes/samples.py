"""
MedTrustX Diagnostics Service — Sample Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.diagnostics import SampleCreate, SampleResponse, SampleUpdate
from src.services import diagnostics_service

router = APIRouter(prefix="/orders/{order_id}/samples", tags=["Samples"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    user_id_str = getattr(request.state, "user_id", None) or request.headers.get("X-User-ID")
    if not user_id_str:
        return uuid.uuid4()
    return uuid.UUID(str(user_id_str))

@router.post(
    "/",
    response_model=SampleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register sample collection",
)
async def add_sample(
    order_id: uuid.UUID,
    data: SampleCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    sample = await diagnostics_service.add_sample(session, tenant_id, order_id, data)
    if not sample:
        raise HTTPException(status_code=404, detail="Order not found")
    await session.commit()
    return sample

@router.put(
    "/{sample_id}/status",
    response_model=SampleResponse,
    summary="Update sample status",
)
async def update_sample(
    order_id: uuid.UUID,
    sample_id: uuid.UUID,
    data: SampleUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    sample = await diagnostics_service.update_sample(
        session, tenant_id, order_id, sample_id, user_id, data
    )
    if not sample:
        raise HTTPException(status_code=404, detail="Sample or order not found")
    await session.commit()
    return sample
