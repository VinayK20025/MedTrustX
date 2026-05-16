"""
MedTrustX Billing Service — Invoices Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.billing import InvoiceCreate, InvoiceResponse, InvoiceUpdate
from src.services import billing_service

router = APIRouter(prefix="/invoices", tags=["Invoices"])

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
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a formal invoice from pending charges",
)
async def create_invoice(
    data: InvoiceCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    invoice = await billing_service.create_invoice(session, tenant_id, data)
    await session.commit()
    
    # Reload with items for response
    return await billing_service.get_invoice(session, tenant_id, invoice.id)

@router.get(
    "/{invoice_id}",
    response_model=InvoiceResponse,
    summary="Get details of a specific invoice including line items",
)
async def get_invoice(
    invoice_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    invoice = await billing_service.get_invoice(session, tenant_id, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.put(
    "/{invoice_id}",
    response_model=InvoiceResponse,
    summary="Update invoice status",
)
async def update_invoice(
    invoice_id: uuid.UUID,
    data: InvoiceUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    invoice = await billing_service.update_invoice_status(session, tenant_id, invoice_id, data)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    await session.commit()
    return await billing_service.get_invoice(session, tenant_id, invoice_id)
