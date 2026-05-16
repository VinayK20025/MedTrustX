"""
MedTrustX Transplant Service — Recipients Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.transplant import RecipientCreate, RecipientResponse
from src.services import transplant_service

router = APIRouter(prefix="/recipients", tags=["Recipients"])

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
    response_model=RecipientResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new recipient",
)
async def create_recipient(
    data: RecipientCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    recipient = await transplant_service.create_recipient(session, tenant_id, data)
    await session.commit()
    return recipient

@router.get(
    "/{recipient_id}",
    response_model=RecipientResponse,
    summary="Get recipient details",
)
async def get_recipient(
    recipient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    recipient = await transplant_service.get_recipient(session, tenant_id, recipient_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    return recipient
