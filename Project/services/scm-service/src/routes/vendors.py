"""
MedTrustX SCM Service — Vendors Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.scm import VendorCreate, VendorResponse, VendorUpdate
from src.services import scm_service

router = APIRouter(prefix="/vendors", tags=["Vendors"])

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
    response_model=VendorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new supplier/vendor",
)
async def create_vendor(
    data: VendorCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    vendor = await scm_service.create_vendor(session, tenant_id, data)
    await session.commit()
    return vendor

@router.get(
    "/{vendor_id}",
    response_model=VendorResponse,
    summary="Get vendor details",
)
async def get_vendor(
    vendor_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    vendor = await scm_service.get_vendor(session, tenant_id, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@router.put(
    "/{vendor_id}",
    response_model=VendorResponse,
    summary="Update vendor status (e.g., blacklisting)",
)
async def update_vendor(
    vendor_id: uuid.UUID,
    data: VendorUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    vendor = await scm_service.update_vendor_status(session, tenant_id, vendor_id, data)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    await session.commit()
    return vendor
