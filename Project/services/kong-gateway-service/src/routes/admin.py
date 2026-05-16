"""
MedTrustX Kong Gateway Shim Service — Admin API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.gateway import (
    ConsumerCreateRequest,
    ConsumerResponse,
    PluginCreateRequest,
    PluginResponse,
    RouteCreateRequest,
    RouteResponse,
    ServiceCreateRequest,
    ServiceResponse,
)
from src.services import gateway_service

router = APIRouter(tags=["Gateway Admin"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Services ──

@router.post("/services", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED, summary="Register upstream service")
async def create_service(data: ServiceCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    svc = await gateway_service.create_service(session, tid, data)
    await session.commit()
    return svc


@router.get("/services", response_model=List[ServiceResponse], summary="List services")
async def list_services(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await gateway_service.get_services(session, tid)


@router.get("/services/{service_id}", response_model=ServiceResponse, summary="Get service")
async def get_service(service_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    svc = await gateway_service.get_service(session, tid, service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    return svc


# ── Routes ──

@router.post("/routes", response_model=RouteResponse, status_code=status.HTTP_201_CREATED, summary="Create route")
async def create_route(data: RouteCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    route = await gateway_service.create_route(session, tid, data)
    await session.commit()
    return route


@router.get("/routes", response_model=List[RouteResponse], summary="List routes")
async def list_routes(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await gateway_service.get_routes(session, tid)


@router.get("/routes/{route_id}", response_model=RouteResponse, summary="Get route")
async def get_route(route_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    route = await gateway_service.get_route(session, tid, route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route


# ── Consumers ──

@router.post("/consumers", response_model=ConsumerResponse, status_code=status.HTTP_201_CREATED, summary="Register consumer")
async def create_consumer(data: ConsumerCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    consumer = await gateway_service.create_consumer(session, tid, data)
    await session.commit()
    return consumer


@router.get("/consumers", response_model=List[ConsumerResponse], summary="List consumers")
async def list_consumers(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await gateway_service.get_consumers(session, tid)


@router.get("/consumers/{consumer_id}", response_model=ConsumerResponse, summary="Get consumer")
async def get_consumer(consumer_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    consumer = await gateway_service.get_consumer(session, tid, consumer_id)
    if not consumer:
        raise HTTPException(status_code=404, detail="Consumer not found")
    return consumer


# ── Plugins ──

@router.post("/plugins", response_model=PluginResponse, status_code=status.HTTP_201_CREATED, summary="Apply plugin")
async def create_plugin(data: PluginCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    plugin = await gateway_service.create_plugin(session, tid, data)
    await session.commit()
    return plugin


@router.get("/plugins", response_model=List[PluginResponse], summary="List plugins")
async def list_plugins(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await gateway_service.get_plugins(session, tid)


@router.get("/plugins/{plugin_id}", response_model=PluginResponse, summary="Get plugin")
async def get_plugin(plugin_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    plugin = await gateway_service.get_plugin(session, tid, plugin_id)
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return plugin


# ── Status ──

@router.get("/status", summary="Gateway status")
async def gateway_status():
    return {
        "server": {"connections_active": 42, "connections_reading": 5, "connections_writing": 10},
        "database": {"reachable": True},
    }
