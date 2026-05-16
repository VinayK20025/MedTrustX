"""
Patient Consent Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_clinical_session
from app.services.consent_manager import ConsentManager
from app.models.consent import ConsentGrantRequest, ConsentResponse

router = APIRouter(prefix="/api/consent/patient", tags=["patient"])

@router.post("/grant", response_model=ConsentResponse)
async def grant_consent(
    request: Request,
    payload: ConsentGrantRequest,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    user_id = getattr(request.state, "user_id", "")
    roles = getattr(request.state, "roles", [])
    
    if payload.patient_id != user_id and "superadmin" not in roles and "doctor" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")

    manager = ConsentManager(session)
    consent_dict = await manager.grant_consent(tenant_id, payload)
    return ConsentResponse(**consent_dict)

@router.post("/{consent_id}/revoke")
async def revoke_consent(
    consent_id: str,
    request: Request,
    session: AsyncSession = Depends(get_clinical_session)
):
    manager = ConsentManager(session)
    await manager.revoke_consent(consent_id)
    return {"status": "revoked"}

@router.get("/{patient_id}", response_model=List[ConsentResponse])
async def list_consents(
    patient_id: str,
    request: Request,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    manager = ConsentManager(session)
    consents = await manager.get_patient_consents(patient_id, tenant_id)
    return [ConsentResponse(**c) for c in consents]
