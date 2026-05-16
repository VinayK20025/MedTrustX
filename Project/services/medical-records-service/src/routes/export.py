"""
MedTrustX Medical Records Service — EHR Export
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.services import records_service

router = APIRouter(prefix="/patients/{patient_id}", tags=["Export"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    user_id_str = getattr(request.state, "user_id", None) or request.headers.get("X-User-ID")
    if not user_id_str:
        return uuid.uuid4()
    return uuid.UUID(str(user_id_str))

@router.get(
    "/ehr-export",
    summary="Export patient medical timeline in FHIR-style format",
)
async def export_ehr(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    
    # Requires high-privilege validation in real app
    bundle = await records_service.mock_fhir_export(session, tenant_id, patient_id, user_id)
    await session.commit()
    
    return bundle
