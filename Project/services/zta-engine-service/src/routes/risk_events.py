"""
MedTrustX ZTA Engine Service — Risk Events Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.zta import RiskEventCreate, RiskEventResponse
from src.services import zta_service

router = APIRouter(prefix="/zta/risk-events", tags=["Risk Events"])

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
    response_model=RiskEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a risk event",
)
async def report_risk_event(
    data: RiskEventCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    event = await zta_service.create_risk_event(session, tenant_id, data)
    await session.commit()
    return event
