"""
MedTrustX Notification Service — Templates Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.notifications import TemplateCreate, TemplateResponse, TemplateUpdate
from src.services import notification_service

router = APIRouter(prefix="/templates", tags=["Templates"])

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
    response_model=TemplateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new template",
)
async def create_template(
    data: TemplateCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    template = await notification_service.create_template(session, tenant_id, data)
    await session.commit()
    return template

@router.get(
    "/{template_id}",
    response_model=TemplateResponse,
    summary="Get template details",
)
async def get_template(
    template_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    template = await notification_service.get_template(session, tenant_id, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.put(
    "/{template_id}",
    response_model=TemplateResponse,
    summary="Update a template",
)
async def update_template(
    template_id: uuid.UUID,
    data: TemplateUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    template = await notification_service.update_template(session, tenant_id, template_id, data)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    await session.commit()
    return template
