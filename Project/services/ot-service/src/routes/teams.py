"""
MedTrustX OT Management Service — Team Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.ot import SurgicalTeamCreate, SurgicalTeamResponse
from src.services import ot_service

router = APIRouter(prefix="/surgeries/{surgery_id}/team", tags=["Teams"])

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
    response_model=SurgicalTeamResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign a staff member to a surgical team",
)
async def assign_team_member(
    surgery_id: uuid.UUID,
    data: SurgicalTeamCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    member = await ot_service.assign_team_member(session, tenant_id, surgery_id, data)
    await session.commit()
    return member

@router.get(
    "/",
    response_model=List[SurgicalTeamResponse],
    summary="Get surgical team assignments",
)
async def get_surgical_team(
    surgery_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await ot_service.get_surgery_team(session, tenant_id, surgery_id)
