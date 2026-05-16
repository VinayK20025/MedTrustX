"""
MedTrustX Treatment Plan Service — Adherence Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.treatment import TreatmentAdherenceCreate, TreatmentAdherenceResponse
from src.services import treatment_service

router = APIRouter(prefix="/treatment-plans", tags=["Adherence"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/{plan_id}/adherence",
    response_model=TreatmentAdherenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record patient adherence to the treatment plan",
)
async def record_adherence(
    plan_id: uuid.UUID,
    data: TreatmentAdherenceCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    adherence = await treatment_service.record_adherence(session, tenant_id, plan_id, data)
    if not adherence:
        raise HTTPException(status_code=404, detail="Treatment plan not found")
    await session.commit()
    return adherence
