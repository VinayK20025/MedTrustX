"""
MedTrustX Access Review Service — Campaigns Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.review import CampaignCreate, CampaignResponse, ReviewItemResponse
from src.services import review_service

router = APIRouter(prefix="/reviews/campaigns", tags=["Campaigns"])

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
    summary="Create a review campaign",
)
async def create_campaign(
    data: CampaignCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    camp = await review_service.create_campaign(session, tenant_id, data)
    await session.commit()
    return camp

@router.get(
    "/{campaign_id}",
    response_model=CampaignResponse,
    summary="Get a review campaign",
)
async def get_campaign(
    campaign_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    camp = await review_service.get_campaign(session, tenant_id, campaign_id)
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return camp

@router.get(
    "/{campaign_id}/items",
    response_model=List[ReviewItemResponse],
    summary="Get campaign items",
)
async def get_campaign_items(
    campaign_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await review_service.get_campaign_items(session, tenant_id, campaign_id)
