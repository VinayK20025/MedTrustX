"""
MedTrustX ZTA Engine Service — Context Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.zta import ContextUpdateRequest, ContextAttributeResponse
from src.services import zta_service

router = APIRouter(prefix="/zta/update-context", tags=["Context"])

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
    response_model=List[ContextAttributeResponse],
    status_code=status.HTTP_200_OK,
    summary="Update session context attributes",
)
async def update_context(
    data: ContextUpdateRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    attrs = await zta_service.update_context(session, tenant_id, data)
    await session.commit()
    return attrs
