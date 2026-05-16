"""
Vitals Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.db.session import get_clinical_session
from app.dependencies import get_redis
from app.services.vitals_processor import VitalsProcessor
from app.models.vitals import VitalsIngestRequest, VitalsIngestionResult

router = APIRouter(prefix="/api/clinical", tags=["vitals"])

@router.post("/vitals", response_model=VitalsIngestionResult)
async def ingest_vitals(
    request: Request,
    payload: VitalsIngestRequest,
    session: AsyncSession = Depends(get_clinical_session),
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    processor = VitalsProcessor(session, redis)
    
    vitals_dicts = [v.model_dump() for v in payload.vitals]
    result = await processor.ingest(tenant_id, payload.patient_id, vitals_dicts)
    return VitalsIngestionResult(**result)

@router.get("/vitals/{patient_id}")
async def get_vitals(
    patient_id: str,
    vital_type: str,
    request: Request,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    from app.db.repositories.vitals_repo import VitalsRepository
    repo = VitalsRepository(session)
    
    records = await repo.get_recent_vitals(tenant_id, patient_id, vital_type, days=30)
    return records
