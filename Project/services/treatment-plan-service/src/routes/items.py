"""
MedTrustX Treatment Plan Service — Items Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.treatment import TreatmentPlanItemCreate, TreatmentPlanItemResponse
from src.services import treatment_service

router = APIRouter(prefix="/treatment-plans", tags=["Treatment Plan Items"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/{plan_id}/items",
    response_model=TreatmentPlanItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new therapeutic or diagnostic item to an existing plan",
)
async def add_plan_item(
    plan_id: uuid.UUID,
    data: TreatmentPlanItemCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    item = await treatment_service.add_plan_item(session, tenant_id, plan_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Treatment plan not found")
    await session.commit()
    return item
