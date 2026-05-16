"""
MedTrustX OpenSearch Search Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.opensearch import (
    DocumentCreate, DocumentResponse, IndexCreate, IndexResponse,
    SearchQueryRequest, SearchQueryResponse
)
from src.services import search_service

router = APIRouter(tags=["OpenSearch Search Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Indexes ──

@router.post("/indexes", response_model=IndexResponse, status_code=status.HTTP_201_CREATED)
async def create_index(data: IndexCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    idx = await search_service.create_index(session, tid, data)
    await session.commit()
    return idx


@router.get("/indexes/{name}", response_model=IndexResponse)
async def get_index(name: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    idx = await search_service.get_index(session, tid, name)
    if not idx:
        raise HTTPException(status_code=404, detail="Index not found")
    return idx


# ── Documents ──

@router.post("/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def index_document(data: DocumentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    doc = await search_service.index_document(session, tid, data)
    await session.commit()
    return doc


# ── Search ──

@router.get("/search", response_model=SearchQueryResponse)
async def search(query: str, index_name: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    req = SearchQueryRequest(query=query, index_name=index_name)
    result = await search_service.execute_search(session, tid, req)
    await session.commit()
    return result
