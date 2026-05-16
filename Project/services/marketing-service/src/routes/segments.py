"""
MedTrustX Marketing Service — Segments Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.marketing import SegmentCreate, SegmentResponse
from src.services import marketing_service

router = APIRouter(prefix="/segments", tags=["Segments"])

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
    response_model=SegmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new segment",
)
async def create_segment(
    data: SegmentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    segment = await marketing_service.create_segment(session, tenant_id, data)
    await session.commit()
    return segment

@router.get(
    "/{segment_id}",
    response_model=SegmentResponse,
    summary="Get segment details",
)
async def get_segment(
    segment_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    segment = await marketing_service.get_segment(session, tenant_id, segment_id)
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    return segment
