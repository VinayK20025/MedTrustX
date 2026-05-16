"""
MedTrustX Diagnostics Service — Patient History Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.diagnostics import PatientDiagnosticsHistoryResponse
from src.services import diagnostics_service

router = APIRouter(prefix="/patients/{patient_id}/diagnostics", tags=["Diagnostic History"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/",
    response_model=PatientDiagnosticsHistoryResponse,
    summary="Get patient diagnostic history",
)
async def get_diagnostic_history(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    orders = await diagnostics_service.get_patient_diagnostics(session, tenant_id, patient_id)
    return PatientDiagnosticsHistoryResponse(
        patient_id=patient_id,
        tenant_id=tenant_id,
        orders=orders,
    )
