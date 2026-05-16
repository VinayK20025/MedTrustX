"""
MedTrustX Edge Connectivity Manager Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.edge import ConnectRequest, MetricResponse, NodeCreate, NodeResponse, SessionResponse, SyncLogResponse
from src.services import edge_service

router = APIRouter(tags=["Edge Connectivity Manager Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/nodes", response_model=NodeResponse, status_code=status.HTTP_201_CREATED)
async def create_node(data: NodeCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    node = await edge_service.create_node(session, tid, data)
    await session.commit()
    return node

@router.post("/connect", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def connect_node(data: ConnectRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sess = await edge_service.connect_node(session, tid, data)
    await session.commit()
    return sess

@router.get("/nodes/{id}", response_model=NodeResponse)
async def get_node(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    node = await edge_service.get_node(session, tid, id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

@router.get("/metrics", response_model=List[MetricResponse])
async def list_metrics(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await edge_service.list_metrics(session, tid)

@router.get("/sync/logs", response_model=List[SyncLogResponse])
async def list_sync_logs(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await edge_service.list_sync_logs(session, tid)
