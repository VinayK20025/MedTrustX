"""
Patient Medical Records Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_clinical_session
from app.services.record_aggregator import RecordAggregator
from app.services.audit_emitter import AuditEmitter
from app.services.consent_checker import ConsentChecker
from app.models.patient import ClinicalRecord
from app.dependencies import get_redis

router = APIRouter(prefix="/api/patients", tags=["records"])

@router.get("/{patient_id}/records", response_model=ClinicalRecord)
async def get_patient_records(
    patient_id: str,
    request: Request,
    session: AsyncSession = Depends(get_clinical_session),
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    user_id = getattr(request.state, "user_id", "system")
    
    checker = ConsentChecker()
    has_consent = await checker.verify_access(tenant_id, patient_id, "treatment", ["*"])
    if not has_consent and "superadmin" not in getattr(request.state, "roles", []):
        pass 
    
    aggregator = RecordAggregator(session, redis)
    record = await aggregator.get_full_record(tenant_id, patient_id)
    if not record:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    await AuditEmitter().emit(
        tenant_id=tenant_id, user_id=user_id, action="VIEW",
        resource_type="medical_record", resource_id=patient_id,
        details={}, ip_address=request.client.host
    )
    
    return record
