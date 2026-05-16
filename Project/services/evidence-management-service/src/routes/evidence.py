"""
MedTrustX Evidence Management Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.evidence import AccessRecordResponse, CustodyCreate, CustodyResponse, EvidenceCreate, EvidenceResponse, MetadataResponse
from src.services import evidence_service

router = APIRouter(tags=["Evidence Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def ingest_evidence(data: EvidenceCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    item = await evidence_service.ingest_evidence(session, tid, data)
    await session.commit()
    return item

@router.get("/evidence/{id}", response_model=EvidenceResponse)
async def get_evidence(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    item = await evidence_service.get_evidence(session, tid, id)
    if not item:
        raise HTTPException(status_code=404, detail="Evidence not found")
    # Log access implicitly via service or middleware in prod
    return item

@router.post("/evidence/{id}/custody", response_model=CustodyResponse, status_code=status.HTTP_201_CREATED)
async def update_custody(id: uuid.UUID, data: CustodyCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    log = await evidence_service.update_custody(session, tid, id, data)
    await session.commit()
    return log

@router.get("/evidence/{id}/metadata", response_model=MetadataResponse)
async def get_metadata(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    meta = await evidence_service.get_metadata(session, tid, id)
    if not meta:
        raise HTTPException(status_code=404, detail="Metadata not found")
    return meta

@router.get("/access-records", response_model=List[AccessRecordResponse])
async def list_access_records(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await evidence_service.list_access_records(session, tid)
