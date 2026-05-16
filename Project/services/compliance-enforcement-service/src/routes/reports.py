"""
MedTrustX Compliance Enforcement Service — Reports Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.enforcement import ComplianceReportCreate, ComplianceReportResponse
from src.services import enforcement_service

router = APIRouter(prefix="/compliance/reports", tags=["Compliance Reports"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=ComplianceReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a compliance report",
)
async def create_compliance_report(
    data: ComplianceReportCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    report = await enforcement_service.create_report(session, tenant_id, data)
    await session.commit()
    return report

@router.get(
    "/{report_id}",
    response_model=ComplianceReportResponse,
    summary="Get report details",
)
async def get_compliance_report(
    report_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    report = await enforcement_service.get_report(session, tenant_id, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Compliance report not found")
    return report
