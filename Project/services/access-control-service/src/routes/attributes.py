"""
MedTrustX Access Control Service — Attributes Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.access import AttributeCreate, AttributeResponse
from src.services import access_service

router = APIRouter(prefix="/attributes", tags=["Attributes"])

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
    response_model=AttributeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or update an attribute",
)
async def create_attribute(
    data: AttributeCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    attr = await access_service.create_attribute(session, tenant_id, data)
    await session.commit()
    return attr

@router.get(
    "/{key}",
    response_model=AttributeResponse,
    summary="Get an attribute by key",
)
async def get_attribute(
    key: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    attr = await access_service.get_attribute(session, tenant_id, key)
    if not attr:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return attr
