"""
MedTrustX Billing Service — Charges Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.billing import ChargeCreate, ChargeResponse
from src.services import billing_service

router = APIRouter(prefix="/charges", tags=["Charges"])

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
    response_model=ChargeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a new billable clinical or operational event",
)
async def create_charge(
    data: ChargeCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    charge = await billing_service.create_charge(session, tenant_id, data)
    await session.commit()
    return charge

@router.get(
    "/{charge_id}",
    response_model=ChargeResponse,
    summary="Get details of a specific charge",
)
async def get_charge(
    charge_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    charge = await billing_service.get_charge(session, tenant_id, charge_id)
    if not charge:
        raise HTTPException(status_code=404, detail="Charge not found")
    return charge
