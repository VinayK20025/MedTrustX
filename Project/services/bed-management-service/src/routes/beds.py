"""
MedTrustX Bed Management Service — Bed Inventory Routes

API: POST /beds | GET /beds | GET /beds/{id} | PUT /beds/{id}
"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.beds import BedCreate, BedDetail, BedResponse, BedUpdate
from src.services import bed_service

router = APIRouter(prefix="/beds", tags=["Beds"])


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
    response_model=BedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new bed",
)
async def create_bed(
    data: BedCreate, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    bed = await bed_service.create_bed(session, tenant_id, data)
    await session.commit()
    return await bed_service.get_bed(session, tenant_id, bed.id)


@router.get(
    "/",
    response_model=List[BedResponse],
    summary="List beds with filters",
)
async def list_beds(
    request: Request,
    status_filter: Optional[str] = Query(None, alias="status"),
    ward: Optional[str] = Query(None),
    bed_type: Optional[str] = Query(None, alias="type"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    beds, _ = await bed_service.list_beds(
        session, tenant_id,
        status=status_filter, ward=ward, bed_type=bed_type,
        page=page, page_size=page_size,
    )
    return beds


@router.get(
    "/{bed_id}",
    response_model=BedDetail,
    summary="Get bed details with allocations",
)
async def get_bed(
    bed_id: uuid.UUID, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    bed = await bed_service.get_bed(session, tenant_id, bed_id)
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    return bed


@router.put(
    "/{bed_id}",
    response_model=BedResponse,
    summary="Update bed status or metadata",
)
async def update_bed(
    bed_id: uuid.UUID, data: BedUpdate, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = None
    raw = request.headers.get("X-User-ID")
    if raw:
        try:
            user_id = uuid.UUID(raw)
        except ValueError:
            pass
    bed = await bed_service.update_bed(session, tenant_id, bed_id, data, changed_by=user_id)
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    await session.commit()
    return await bed_service.get_bed(session, tenant_id, bed_id)
