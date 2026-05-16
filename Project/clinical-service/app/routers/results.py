"""
Results Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.session import get_clinical_session
from app.dependencies import get_redis
from app.services.result_processor import ResultProcessor
from app.models.result import ResultRecordRequest, ResultRecord

router = APIRouter(prefix="/api/clinical/orders/{order_id}/results", tags=["results"])

@router.post("", response_model=ResultRecord)
async def record_result(
    order_id: str,
    patient_id: str,
    request: Request,
    payload: ResultRecordRequest,
    session: AsyncSession = Depends(get_clinical_session),
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    processor = ResultProcessor(session, redis)
    
    result = await processor.record_result(tenant_id, order_id, payload.model_dump(), patient_id)
    return ResultRecord(**result)
