"""
MedTrustX Compliance Governance Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.compliance_governance import (
    ComplianceControlCreate, ComplianceControlResponse,
    ComplianceEvidenceCreate, ComplianceEvidenceResponse,
    CompliancePolicyCreate, CompliancePolicyResponse,
    ComplianceViolationCreate, ComplianceViolationResponse,
    RegulatoryReportCreate, RegulatoryReportResponse
)
from src.services import compliance_governance_service

router = APIRouter(tags=["Compliance Governance"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Policies ──

@router.post("/compliance/policies", response_model=CompliancePolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(data: CompliancePolicyCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    policy = await compliance_governance_service.create_policy(session, tid, data)
    await session.commit()
    return policy

@router.get("/compliance/policies/{policy_id}", response_model=CompliancePolicyResponse)
async def get_policy(policy_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    policy = await compliance_governance_service.get_policy(session, tid, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


# ── Controls ──

@router.post("/compliance/controls", response_model=ComplianceControlResponse, status_code=status.HTTP_201_CREATED)
async def create_control(data: ComplianceControlCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    control = await compliance_governance_service.create_control(session, tid, data)
    await session.commit()
    return control

@router.get("/compliance/controls/{control_id}", response_model=ComplianceControlResponse)
async def get_control(control_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    control = await compliance_governance_service.get_control(session, tid, control_id)
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    return control


# ── Violations ──

@router.post("/compliance/violations", response_model=ComplianceViolationResponse, status_code=status.HTTP_201_CREATED)
async def record_violation(data: ComplianceViolationCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    violation = await compliance_governance_service.record_violation(session, tid, data)
    await session.commit()
    return violation

@router.get("/compliance/violations", response_model=List[ComplianceViolationResponse])
async def get_violations(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await compliance_governance_service.get_violations(session, tid)


# ── Evidence ──

@router.post("/compliance/evidence", response_model=ComplianceEvidenceResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(data: ComplianceEvidenceCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    evidence = await compliance_governance_service.upload_evidence(session, tid, data)
    await session.commit()
    return evidence


# ── Reports ──

@router.post("/compliance/reports", response_model=RegulatoryReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(data: RegulatoryReportCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    report = await compliance_governance_service.generate_report(session, tid, data)
    await session.commit()
    return report

@router.get("/compliance/reports", response_model=List[RegulatoryReportResponse])
async def get_reports(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await compliance_governance_service.get_reports(session, tid)
