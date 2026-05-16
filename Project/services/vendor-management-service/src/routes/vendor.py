"""
MedTrustX Vendor Management Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.vendor import (
    SLACreate, SLAResponse,
    VendorContractCreate, VendorContractResponse,
    VendorCreate, VendorPerformanceResponse,
    VendorResponse, VendorRiskResponse
)
from src.services import vendor_service

router = APIRouter(tags=["Vendor Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Vendors ──

@router.post("/vendors", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
async def onboard_vendor(data: VendorCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    vendor = await vendor_service.onboard_vendor(session, tid, data)
    await session.commit()
    return vendor

@router.get("/vendors/{vendor_id}", response_model=VendorResponse)
async def get_vendor(vendor_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    vendor = await vendor_service.get_vendor(session, tid, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


# ── Contracts ──

@router.post("/contracts", response_model=VendorContractResponse, status_code=status.HTTP_201_CREATED)
async def create_contract(data: VendorContractCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    contract = await vendor_service.create_contract(session, tid, data)
    await session.commit()
    return contract

@router.get("/contracts/{contract_id}", response_model=VendorContractResponse)
async def get_contract(contract_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    contract = await vendor_service.get_contract(session, tid, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract


# ── SLAs ──

@router.post("/slas", response_model=SLAResponse, status_code=status.HTTP_201_CREATED)
async def create_sla(data: SLACreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sla = await vendor_service.create_sla(session, tid, data)
    await session.commit()
    return sla

@router.get("/slas/{vendor_id}", response_model=List[SLAResponse])
async def get_vendor_slas(vendor_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await vendor_service.get_vendor_slas(session, tid, vendor_id)


# ── Performance & Risks ──

@router.get("/vendors/{vendor_id}/performance", response_model=List[VendorPerformanceResponse])
async def get_vendor_performance(vendor_id: uuid.UUID, request: Request, limit: int = 50, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await vendor_service.get_vendor_performance(session, tid, vendor_id, limit)

@router.get("/vendors/{vendor_id}/risks", response_model=List[VendorRiskResponse])
async def get_vendor_risks(vendor_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await vendor_service.get_vendor_risks(session, tid, vendor_id)
