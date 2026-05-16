"""
MedTrustX Physical Access Control Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.access import AccessCheckRequest, AccessCheckResponse, AccessLogResponse, CredentialCreate, CredentialResponse, PointCreate, PointResponse, PolicyCreate, PolicyResponse
from src.services import access_service

router = APIRouter(tags=["Physical Access Control Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/access-points", response_model=PointResponse, status_code=status.HTTP_201_CREATED)
async def create_point(data: PointCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    pt = await access_service.create_point(session, tid, data)
    await session.commit()
    return pt

@router.post("/credentials", response_model=CredentialResponse, status_code=status.HTTP_201_CREATED)
async def create_credential(data: CredentialCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    c = await access_service.create_credential(session, tid, data)
    await session.commit()
    return c

@router.post("/policies", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(data: PolicyCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    p = await access_service.create_policy(session, tid, data)
    await session.commit()
    return p

@router.post("/access/check", response_model=AccessCheckResponse)
async def check_access(data: AccessCheckRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    res = await access_service.verify_access(session, tid, data)
    await session.commit()
    if not res.granted:
        raise HTTPException(status_code=403, detail=res.reason)
    return res

@router.get("/access/logs", response_model=List[AccessLogResponse])
async def list_logs(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await access_service.list_logs(session, tid)
