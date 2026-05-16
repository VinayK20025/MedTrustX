"""
MedTrustX Diagnostics Service — Results Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.diagnostics import ResultCreate, ResultResponse
from src.services import diagnostics_service

router = APIRouter(prefix="/orders/{order_id}/results", tags=["Results"])

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
    response_model=ResultResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add test result",
)
async def add_result(
    order_id: uuid.UUID,
    data: ResultCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    res = await diagnostics_service.add_result(session, tenant_id, order_id, data)
    if not res:
        raise HTTPException(status_code=404, detail="Order not found")
    await session.commit()
    return res

@router.post(
    "/{result_id}/validate",
    response_model=ResultResponse,
    summary="Validate test result",
)
async def validate_result(
    order_id: uuid.UUID,
    result_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    res = await diagnostics_service.validate_result(session, tenant_id, order_id, result_id, user_id)
    if not res:
        raise HTTPException(status_code=404, detail="Result not found")
    await session.commit()
    return res
