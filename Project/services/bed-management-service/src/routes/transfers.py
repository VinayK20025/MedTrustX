"""
MedTrustX Bed Management Service — Transfer Routes

API: POST /bed-transfers | GET /bed-transfers/{id}
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.beds import BedTransferCreate, BedTransferResponse
from src.services import bed_service

router = APIRouter(prefix="/bed-transfers", tags=["Bed Transfers"])


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
    response_model=BedTransferResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Transfer patient between beds",
    description=(
        "Moves a patient from one bed to another. Automatically releases "
        "the source bed (→ cleaning), occupies the destination bed, "
        "closes the old allocation, and creates a new one."
    ),
)
async def create_transfer(
    data: BedTransferCreate, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    initiated_by = None
    raw = request.headers.get("X-User-ID")
    if raw:
        try:
            initiated_by = uuid.UUID(raw)
        except ValueError:
            pass
    try:
        transfer = await bed_service.create_transfer(
            session, tenant_id, data, initiated_by=initiated_by,
        )
        await session.commit()
        return transfer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/{transfer_id}",
    response_model=BedTransferResponse,
    summary="Get transfer details",
)
async def get_transfer(
    transfer_id: uuid.UUID, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    transfer = await bed_service.get_transfer(session, tenant_id, transfer_id)
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return transfer
