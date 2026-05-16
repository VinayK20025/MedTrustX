"""
MedTrustX Legal Case Management Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.legal import CaseCreate, CaseResponse, ComplianceResponse, DocumentCreate, DocumentResponse, TaskCreate, TaskResponse
from src.services import legal_service

router = APIRouter(tags=["Legal Case Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/cases", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(data: CaseCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    case = await legal_service.create_case(session, tid, data)
    await session.commit()
    return case

@router.get("/cases/{id}", response_model=CaseResponse)
async def get_case(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    case = await legal_service.get_case(session, tid, id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.post("/cases/{id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def add_document(id: uuid.UUID, data: DocumentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    doc = await legal_service.add_document(session, tid, id, data)
    await session.commit()
    return doc

@router.post("/cases/{id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def add_task(id: uuid.UUID, data: TaskCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    task = await legal_service.add_task(session, tid, id, data)
    await session.commit()
    return task

@router.get("/compliance", response_model=List[ComplianceResponse])
async def list_compliance(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await legal_service.list_compliance(session, tid)
