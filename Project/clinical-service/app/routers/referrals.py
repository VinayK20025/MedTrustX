"""
Referrals Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_clinical_session
from app.dependencies import get_redis
from app.services.referral_manager import ReferralManager
from app.models.referral import ReferralCreateRequest, ReferralRecord

router = APIRouter(prefix="/api/clinical/referrals", tags=["referrals"])

@router.post("", response_model=ReferralRecord)
async def create_referral(
    request: Request,
    payload: ReferralCreateRequest,
    session: AsyncSession = Depends(get_clinical_session),
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    manager = ReferralManager(session, redis)
    
    referral = await manager.create_referral(tenant_id, payload.model_dump())
    
    return ReferralRecord(
        id=referral["id"],
        tenant_id=referral["tenant_id"],
        patient_id=referral["patient_id"],
        referring_doctor_id=referral["ordered_by"],
        specialty=payload.specialty,
        reason=payload.reason,
        urgency=payload.urgency,
        status=referral["status"],
        icd10_code=payload.icd10_code,
        created_at=referral["ordered_at"]
    )
