"""
MedTrustX Billing Service — Payments Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.billing import PaymentCreate, PaymentResponse
from src.services import billing_service

router = APIRouter(prefix="/payments", tags=["Payments"])

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
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Process a financial settlement against an invoice",
)
async def create_payment(
    data: PaymentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        payment = await billing_service.process_payment(session, tenant_id, data)
        await session.commit()
        return payment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{payment_id}",
    response_model=PaymentResponse,
    summary="Get details of a specific payment transaction",
)
async def get_payment(
    payment_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    payment = await billing_service.get_payment(session, tenant_id, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
