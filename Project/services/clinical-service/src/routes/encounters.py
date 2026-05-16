"""
MedTrustX Clinical Service — Encounter Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.clinical import EncounterCreate, EncounterDetailResponse, EncounterResponse, EncounterUpdate
from src.services import clinical_service

router = APIRouter(prefix="/encounters", tags=["Encounters"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


@router.post(
    "/",
    response_model=EncounterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create encounter",
)
async def create_encounter(
    data: EncounterCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        encounter = await clinical_service.create_encounter(session, tenant_id, data)
        await session.commit()
        return encounter
    except Exception as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to create encounter: {str(exc)}",
        )


@router.get(
    "/{encounter_id}",
    response_model=EncounterDetailResponse,
    summary="Get encounter details",
)
async def get_encounter(
    encounter_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    encounter = await clinical_service.get_encounter(
        session, tenant_id, encounter_id, load_relations=True
    )
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    return encounter


@router.put(
    "/{encounter_id}",
    response_model=EncounterResponse,
    summary="Update encounter",
)
async def update_encounter(
    encounter_id: uuid.UUID,
    data: EncounterUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    encounter = await clinical_service.update_encounter(session, tenant_id, encounter_id, data)
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    await session.commit()
    return encounter
