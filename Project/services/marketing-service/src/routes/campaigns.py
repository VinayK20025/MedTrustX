"""
MedTrustX Marketing Service — Campaigns Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.marketing import CampaignCreate, CampaignResponse, CampaignUpdate, CampaignTargetCreate, CampaignTargetResponse
from src.services import marketing_service

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

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
    response_model=CampaignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new campaign",
)
async def create_campaign(
    data: CampaignCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    campaign = await marketing_service.create_campaign(session, tenant_id, data)
    await session.commit()
    return campaign

@router.get(
    "/{campaign_id}",
    response_model=CampaignResponse,
    summary="Get campaign details",
)
async def get_campaign(
    campaign_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    campaign = await marketing_service.get_campaign(session, tenant_id, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.put(
    "/{campaign_id}",
    response_model=CampaignResponse,
    summary="Update a campaign",
)
async def update_campaign(
    campaign_id: uuid.UUID,
    data: CampaignUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    campaign = await marketing_service.update_campaign(session, tenant_id, campaign_id, data)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    await session.commit()
    return campaign

@router.post(
    "/{campaign_id}/targets",
    response_model=CampaignTargetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add target to a campaign",
)
async def add_campaign_target(
    campaign_id: uuid.UUID,
    data: CampaignTargetCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    target = await marketing_service.add_target(session, tenant_id, campaign_id, data)
    await session.commit()
    return target

@router.get(
    "/{campaign_id}/targets",
    response_model=List[CampaignTargetResponse],
    summary="Get targets for a campaign",
)
async def get_campaign_targets(
    campaign_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await marketing_service.get_targets(session, tenant_id, campaign_id)
