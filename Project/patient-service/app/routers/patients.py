"""
Patient API Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.session import get_clinical_session
from app.services.patient_manager import PatientManager
from app.services.audit_emitter import AuditEmitter
from app.services.fhir_exporter import FHIRExporter
from app.models.patient import PatientCreateRequest, PatientUpdateRequest, PatientResponse
from app.fhir.validator import validate_patient

router = APIRouter(tags=["patients"])

@router.post("/api/patients", response_model=PatientResponse)
async def create_patient(
    request: Request,
    payload: PatientCreateRequest,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    user_id = getattr(request.state, "user_id", "system")
    
    manager = PatientManager(session)
    try:
        patient = await manager.create_patient(tenant_id, payload, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    await AuditEmitter().emit(
        tenant_id=tenant_id, user_id=user_id, action="CREATE",
        resource_type="patient", resource_id=str(patient["id"]),
        details={"mrn": patient["mrn"]}, ip_address=request.client.host
    )
    
    return PatientResponse(**patient)

@router.get("/api/patients", response_model=List[PatientResponse])
async def list_patients(
    request: Request,
    page: int = 1,
    page_size: int = 50,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    manager = PatientManager(session)
    
    offset = (page - 1) * page_size
    patients = await manager.list_patients(tenant_id, offset=offset, limit=page_size)
    return [PatientResponse(**p) for p in patients]

@router.get("/api/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    request: Request,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    user_id = getattr(request.state, "user_id", "system")
    
    manager = PatientManager(session)
    patient = await manager.get_patient(tenant_id, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    await AuditEmitter().emit(
        tenant_id=tenant_id, user_id=user_id, action="VIEW",
        resource_type="patient_record", resource_id=patient_id,
        details={}, ip_address=request.client.host
    )
    
    return PatientResponse(**patient)

@router.get("/fhir/r4/Patient/{patient_id}")
async def get_patient_fhir(
    patient_id: str,
    request: Request,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    exporter = FHIRExporter(session)
    fhir_res = await exporter.export_patient(tenant_id, patient_id)
    
    if not fhir_res:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return fhir_res
