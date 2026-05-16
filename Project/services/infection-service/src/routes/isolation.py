"""
MedTrustX Infection Control Service — Isolation Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.infection import IsolationCaseCreate, IsolationCaseResponse
from src.services import infection_service

router = APIRouter(tags=["Isolation"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/isolation",
    response_model=IsolationCaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a new isolation protocol",
)
async def start_isolation(
    data: IsolationCaseCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    isolation = await infection_service.start_isolation(session, tenant_id, data)
    await session.commit()
    return isolation

@router.get(
    "/patients/{patient_id}/isolation",
    response_model=List[IsolationCaseResponse],
    summary="Get isolation history for a patient",
)
async def get_patient_isolation(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await infection_service.get_patient_isolation(session, tenant_id, patient_id)
