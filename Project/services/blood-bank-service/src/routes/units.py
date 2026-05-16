"""
MedTrustX Blood Bank Service — Inventory Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.blood_bank import BloodUnitCreate, BloodUnitResponse, BloodUnitUpdate
from src.services import blood_bank_service

router = APIRouter(prefix="/blood-units", tags=["Inventory"])

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
    response_model=BloodUnitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new blood unit to inventory",
)
async def add_blood_unit(
    data: BloodUnitCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    unit = await blood_bank_service.add_blood_unit(session, tenant_id, data)
    await session.commit()
    return unit

@router.get(
    "/",
    response_model=List[BloodUnitResponse],
    summary="List available blood units",
)
async def get_inventory(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await blood_bank_service.get_inventory(session, tenant_id)

@router.put(
    "/{unit_id}",
    response_model=BloodUnitResponse,
    summary="Update blood unit status (e.g., reserve or use)",
)
async def update_blood_unit(
    unit_id: uuid.UUID,
    data: BloodUnitUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    unit = await blood_bank_service.update_blood_unit(session, tenant_id, unit_id, data)
    if not unit:
        raise HTTPException(status_code=404, detail="Blood unit not found")
    await session.commit()
    return unit
