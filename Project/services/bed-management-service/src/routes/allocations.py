"""
MedTrustX Bed Management Service — Allocation Routes

API: POST /bed-allocations | GET /bed-allocations/{id} | PUT /bed-allocations/{id}
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.beds import BedAllocationCreate, BedAllocationResponse, BedAllocationUpdate
from src.services import bed_service

router = APIRouter(prefix="/bed-allocations", tags=["Bed Allocations"])


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
    response_model=BedAllocationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Allocate a bed to a patient",
    description=(
        "Creates a transactional bed allocation (admission). "
        "The bed must be in 'available' status. Automatically "
        "marks the bed as 'occupied' and logs the status change."
    ),
)
async def create_allocation(
    data: BedAllocationCreate, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        alloc = await bed_service.create_allocation(session, tenant_id, data)
        await session.commit()
        return alloc
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/{allocation_id}",
    response_model=BedAllocationResponse,
    summary="Get allocation details",
)
async def get_allocation(
    allocation_id: uuid.UUID, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    alloc = await bed_service.get_allocation(session, tenant_id, allocation_id)
    if not alloc:
        raise HTTPException(status_code=404, detail="Allocation not found")
    return alloc


@router.put(
    "/{allocation_id}",
    response_model=BedAllocationResponse,
    summary="Update allocation (release bed on discharge)",
    description=(
        "Updates allocation status. Setting status to 'completed' or "
        "'cancelled' releases the bed and transitions it to 'cleaning'."
    ),
)
async def update_allocation(
    allocation_id: uuid.UUID, data: BedAllocationUpdate, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    alloc = await bed_service.update_allocation(session, tenant_id, allocation_id, data)
    if not alloc:
        raise HTTPException(status_code=404, detail="Allocation not found")
    await session.commit()
    return alloc
