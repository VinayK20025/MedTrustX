"""
MedTrustX SCM Service — Shipments Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.scm import ShipmentResponse
from src.services import scm_service

router = APIRouter(prefix="/shipments", tags=["Shipments"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/{shipment_id}",
    response_model=ShipmentResponse,
    summary="Get logistics tracking details for an active PO",
)
async def get_shipment(
    shipment_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    shipment = await scm_service.get_shipment(session, tenant_id, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment
