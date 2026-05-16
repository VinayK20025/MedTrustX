"""
MedTrustX HR Service — Departments Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.hr import DepartmentCreate, DepartmentResponse
from src.services import hr_service

router = APIRouter(prefix="/departments", tags=["Departments"])

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
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new hospital department",
)
async def create_department(
    data: DepartmentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    dept = await hr_service.create_department(session, tenant_id, data)
    await session.commit()
    return dept

@router.get(
    "/{dept_id}",
    response_model=DepartmentResponse,
    summary="Get department details",
)
async def get_department(
    dept_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    dept = await hr_service.get_department(session, tenant_id, dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept
