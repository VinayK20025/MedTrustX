"""
MedTrustX Transplant Service — Transplants Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.transplant import TransplantCreate, TransplantResponse
from src.services import transplant_service

router = APIRouter(prefix="/transplants", tags=["Transplants"])

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
    response_model=TransplantResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule a transplant",
)
async def create_transplant(
    data: TransplantCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    transplant = await transplant_service.schedule_transplant(session, tenant_id, data)
    await session.commit()
    return transplant

@router.get(
    "/{transplant_id}",
    response_model=TransplantResponse,
    summary="Get transplant details",
)
async def get_transplant(
    transplant_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    transplant = await transplant_service.get_transplant(session, tenant_id, transplant_id)
    if not transplant:
        raise HTTPException(status_code=404, detail="Transplant not found")
    return transplant
