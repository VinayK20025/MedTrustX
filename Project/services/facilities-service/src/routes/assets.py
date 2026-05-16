"""
MedTrustX Facilities Service — Assets Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.facilities import AssetCreate, AssetResponse, AssetUpdate
from src.services import facilities_service

router = APIRouter(prefix="/assets", tags=["Assets"])

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
    response_model=AssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new physical asset",
)
async def create_asset(
    data: AssetCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    asset = await facilities_service.create_asset(session, tenant_id, data)
    await session.commit()
    return asset

@router.get(
    "/{asset_id}",
    response_model=AssetResponse,
    summary="Get asset details",
)
async def get_asset(
    asset_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    asset = await facilities_service.get_asset(session, tenant_id, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.put(
    "/{asset_id}",
    response_model=AssetResponse,
    summary="Update asset operational status",
)
async def update_asset(
    asset_id: uuid.UUID,
    data: AssetUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    asset = await facilities_service.update_asset_status(session, tenant_id, asset_id, data)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    await session.commit()
    return asset
