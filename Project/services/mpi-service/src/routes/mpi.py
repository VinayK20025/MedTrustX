"""
MedTrustX MPI Service — Main MPI Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.mpi import (
    MasterPatientCreate, MasterPatientResponse,
    PatientLinkCreate, PatientLinkResponse,
    MergeRequest, MergeResponse
)
from src.services import mpi_service

router = APIRouter(prefix="/mpi", tags=["MPI"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/register",
    response_model=MasterPatientResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a master patient identity",
)
async def register_patient(
    data: MasterPatientCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    mp = await mpi_service.register_patient(session, tenant_id, data)
    await session.commit()
    return mp

@router.get(
    "/{patient_id}",
    response_model=MasterPatientResponse,
    summary="Get a master patient identity",
)
async def get_patient(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    mp = await mpi_service.get_master_patient(session, tenant_id, patient_id)
    if not mp:
        raise HTTPException(status_code=404, detail="Patient not found")
    return mp

@router.post(
    "/link",
    response_model=PatientLinkResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Link a source patient to a master identity",
)
async def link_patient(
    data: PatientLinkCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    link = await mpi_service.link_patient(session, tenant_id, data)
    await session.commit()
    return link

@router.get(
    "/{patient_id}/links",
    response_model=List[PatientLinkResponse],
    summary="Get links for a master patient",
)
async def get_patient_links(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await mpi_service.get_patient_links(session, tenant_id, patient_id)

@router.post(
    "/merge",
    response_model=MergeResponse,
    summary="Merge two master identities",
)
async def merge_patients(
    data: MergeRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    hist = await mpi_service.merge_patients(session, tenant_id, data)
    if not hist:
        raise HTTPException(status_code=400, detail="One or both patients not found")
    await session.commit()
    return hist
