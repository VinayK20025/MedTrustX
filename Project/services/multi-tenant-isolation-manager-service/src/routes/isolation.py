"""
MedTrustX Multi-Tenant Isolation Manager Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.isolation import AccessLogResponse, ContextResponse, PolicyCreate, PolicyResponse, TenantCreate, TenantResponse
from src.services import isolation_service

router = APIRouter(tags=["Multi-Tenant Isolation Manager Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/tenants", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(data: TenantCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    tenant = await isolation_service.create_tenant(session, tid, data)
    await session.commit()
    return tenant

@router.get("/tenants/{id}", response_model=TenantResponse)
async def get_tenant(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    tenant = await isolation_service.get_tenant(session, tid, id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.post("/policies", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(data: PolicyCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    p = await isolation_service.create_policy(session, tid, data)
    await session.commit()
    return p

@router.get("/access-logs", response_model=List[AccessLogResponse])
async def list_access_logs(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await isolation_service.list_access_logs(session, tid)

@router.get("/context", response_model=List[ContextResponse])
async def list_context(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await isolation_service.list_context(session, tid)
