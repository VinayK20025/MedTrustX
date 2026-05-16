"""
MedTrustX Network Provisioning Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.network import DeviceResponse, IPAllocate, IPResponse, NetworkCreate, NetworkResponse, SubnetCreate, SubnetResponse
from src.services import network_service

router = APIRouter(tags=["Network Provisioning Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/networks", response_model=NetworkResponse, status_code=status.HTTP_201_CREATED)
async def create_network(data: NetworkCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    net = await network_service.create_network(session, tid, data)
    await session.commit()
    return net

@router.post("/subnets", response_model=SubnetResponse, status_code=status.HTTP_201_CREATED)
async def create_subnet(data: SubnetCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sub = await network_service.create_subnet(session, tid, data)
    await session.commit()
    return sub

@router.post("/ip/allocate", response_model=IPResponse, status_code=status.HTTP_201_CREATED)
async def allocate_ip(data: IPAllocate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    ip = await network_service.allocate_ip(session, tid, data)
    await session.commit()
    return ip

@router.get("/networks/{id}", response_model=NetworkResponse)
async def get_network(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    net = await network_service.get_network(session, tid, id)
    if not net:
        raise HTTPException(status_code=404, detail="Network not found")
    return net

@router.get("/devices", response_model=List[DeviceResponse])
async def list_devices(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await network_service.list_devices(session, tid)
