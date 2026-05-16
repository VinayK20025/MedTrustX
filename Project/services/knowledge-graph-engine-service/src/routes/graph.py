"""
MedTrustX Knowledge Graph Engine Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.graph import EdgeCreate, EdgeResponse, GraphQueryRequest, GraphQueryResponse, InferenceResponse, NodeCreate, NodeResponse
from src.services import graph_service

router = APIRouter(tags=["Knowledge Graph Engine Service"])

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
    node = await graph_service.create_node(session, tid, data)
    await session.commit()
    return node

@router.get("/nodes/{id}", response_model=NodeResponse)
async def get_node(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    node = await graph_service.get_node(session, tid, id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

@router.post("/edges", response_model=EdgeResponse, status_code=status.HTTP_201_CREATED)
async def create_edge(data: EdgeCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    edge = await graph_service.create_edge(session, tid, data)
    await session.commit()
    return edge

@router.post("/graph/query", response_model=GraphQueryResponse)
async def execute_query(data: GraphQueryRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    resp = await graph_service.execute_query(session, tid, data)
    await session.commit()
    return resp

@router.get("/inference", response_model=List[InferenceResponse])
async def list_inference(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await graph_service.list_inference(session, tid)
