"""
MedTrustX ICU Service — High-Frequency Vitals Streaming Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.icu import ICUVitalResponse, ICUVitalsBatchCreate
from src.services import icu_service

router = APIRouter(tags=["Vitals Stream"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/icu/vitals",
    status_code=status.HTTP_201_CREATED,
    summary="Stream batch ingestion of ICU vitals",
)
async def ingest_vitals(
    data: ICUVitalsBatchCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    count = await icu_service.ingest_vitals_batch(session, tenant_id, data)
    await session.commit()
    return {"status": "success", "records_ingested": count}

@router.get(
    "/icu/patients/{patient_id}/vitals",
    response_model=List[ICUVitalResponse],
    summary="Get recent streaming vitals for an ICU patient",
)
async def get_vitals(
    patient_id: uuid.UUID,
    request: Request,
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await icu_service.get_patient_vitals_stream(session, tenant_id, patient_id, limit)
