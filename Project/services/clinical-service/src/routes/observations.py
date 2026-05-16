"""
MedTrustX Clinical Service — Observation Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.clinical import ObservationCreate, ObservationResponse
from src.services import clinical_service

router = APIRouter(prefix="/encounters/{encounter_id}/observations", tags=["Observations"])


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


@router.post(
    "/",
    response_model=ObservationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add observation (vitals)",
)
async def add_observation(
    encounter_id: uuid.UUID,
    data: ObservationCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    
    observation = await clinical_service.add_observation(
        session, tenant_id, encounter_id, user_id, data
    )
    if not observation:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    await session.commit()
    return observation


@router.get(
    "/",
    response_model=List[ObservationResponse],
    summary="List observations",
)
async def list_observations(
    encounter_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await clinical_service.list_observations(session, tenant_id, encounter_id)
