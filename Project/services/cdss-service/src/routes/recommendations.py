"""
MedTrustX CDSS Service — Recommendations Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.cdss import CDSSRecommendationCreate, CDSSRecommendationResponse
from src.services import cdss_service

router = APIRouter(tags=["Recommendations"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/cdss/recommendations",
    response_model=CDSSRecommendationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a clinical pathway recommendation (usually internal)",
)
async def add_recommendation(
    data: CDSSRecommendationCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rec = await cdss_service.add_recommendation(session, tenant_id, data)
    await session.commit()
    return rec

@router.get(
    "/patients/{patient_id}/cdss/recommendations",
    response_model=List[CDSSRecommendationResponse],
    summary="Get clinical guidance recommendations for a patient",
)
async def get_patient_recommendations(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await cdss_service.get_patient_recommendations(session, tenant_id, patient_id)
