"""
MedTrustX Pharmacy Service — Dispense Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.pharmacy import DispenseCreate, DispenseResponse
from src.services import pharmacy_service

router = APIRouter(prefix="/prescriptions/items/{item_id}/dispenses", tags=["Dispenses"])

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
    response_model=DispenseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Dispense a medication item",
)
async def add_dispense(
    item_id: uuid.UUID,
    data: DispenseCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    dispense = await pharmacy_service.add_dispense(session, tenant_id, item_id, user_id, data)
    if not dispense:
        raise HTTPException(status_code=404, detail="Prescription item not found")
    await session.commit()
    return dispense
