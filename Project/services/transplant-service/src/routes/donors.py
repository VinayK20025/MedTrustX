"""
MedTrustX Transplant Service — Donors Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.transplant import DonorCreate, DonorResponse, DonorUpdate
from src.services import transplant_service

router = APIRouter(prefix="/donors", tags=["Donors"])

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
    response_model=DonorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new donor",
)
async def create_donor(
    data: DonorCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    donor = await transplant_service.create_donor(session, tenant_id, data)
    await session.commit()
    return donor

@router.get(
    "/{donor_id}",
    response_model=DonorResponse,
    summary="Get donor details",
)
async def get_donor(
    donor_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    donor = await transplant_service.get_donor(session, tenant_id, donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    return donor

@router.put(
    "/{donor_id}",
    response_model=DonorResponse,
    summary="Update a donor",
)
async def update_donor(
    donor_id: uuid.UUID,
    data: DonorUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    donor = await transplant_service.update_donor(session, tenant_id, donor_id, data)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    await session.commit()
    return donor
