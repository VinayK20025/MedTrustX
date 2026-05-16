"""
Consent Verification Gate Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_clinical_session
from app.services.policy_engine import ConsentPolicyEngine
from app.models.consent import VerificationRequest, VerificationResponse

router = APIRouter(prefix="/api/consent/verify", tags=["verify"])

@router.post("", response_model=VerificationResponse)
async def verify_consent(
    request: Request,
    payload: VerificationRequest,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    engine = ConsentPolicyEngine(session)
    
    result = await engine.verify_access(
        tenant_id=tenant_id,
        patient_id=payload.patient_id,
        purpose=payload.purpose,
        required_elements=payload.required_elements
    )
    
    return VerificationResponse(**result)
