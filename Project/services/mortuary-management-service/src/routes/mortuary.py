"""
MedTrustX Mortuary Management Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.mortuary import (
    BodyAllocationCreate, BodyAllocationResponse,
    CustodyLogCreate, CustodyLogResponse,
    MortuaryRecordCreate, MortuaryRecordResponse,
    ReleaseCreate, ReleaseResponse,
    StorageUnitCreate, StorageUnitResponse
)
from src.services import mortuary_service

router = APIRouter(tags=["Mortuary Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Records ──

@router.post("/mortuary/records", response_model=MortuaryRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_record(data: MortuaryRecordCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    record = await mortuary_service.create_record(session, tid, data)
    await session.commit()
    return record

@router.get("/mortuary/records/{record_id}", response_model=MortuaryRecordResponse)
async def get_record(record_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    record = await mortuary_service.get_record(session, tid, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


# ── Storage Units ──

@router.post("/storage-units", response_model=StorageUnitResponse, status_code=status.HTTP_201_CREATED)
async def create_storage_unit(data: StorageUnitCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    unit = await mortuary_service.create_storage_unit(session, tid, data)
    await session.commit()
    return unit

@router.get("/storage-units/{unit_id}", response_model=StorageUnitResponse)
async def get_storage_unit(unit_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    unit = await mortuary_service.get_storage_unit(session, tid, unit_id)
    if not unit:
        raise HTTPException(status_code=404, detail="Storage unit not found")
    return unit


# ── Allocations ──

@router.post("/allocations", response_model=BodyAllocationResponse, status_code=status.HTTP_201_CREATED)
async def allocate_body(data: BodyAllocationCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    allocation = await mortuary_service.allocate_body(session, tid, data)
    await session.commit()
    return allocation

@router.get("/allocations/{allocation_id}", response_model=BodyAllocationResponse)
async def get_allocation(allocation_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    allocation = await mortuary_service.get_allocation(session, tid, allocation_id)
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")
    return allocation


# ── Custody Logs ──

@router.post("/custody-logs", response_model=CustodyLogResponse, status_code=status.HTTP_201_CREATED)
async def log_custody(data: CustodyLogCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    log = await mortuary_service.log_custody(session, tid, data)
    await session.commit()
    return log

@router.get("/custody-logs/{record_id}", response_model=List[CustodyLogResponse])
async def get_custody_logs(record_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await mortuary_service.get_custody_logs(session, tid, record_id)


# ── Releases ──

@router.post("/releases", response_model=ReleaseResponse, status_code=status.HTTP_201_CREATED)
async def release_body(data: ReleaseCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    release = await mortuary_service.release_body(session, tid, data)
    await session.commit()
    return release

@router.get("/releases/{release_id}", response_model=ReleaseResponse)
async def get_release(release_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    release = await mortuary_service.get_release(session, tid, release_id)
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")
    return release
