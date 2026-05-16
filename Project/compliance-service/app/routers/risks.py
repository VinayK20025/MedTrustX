"""
Risks Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_operational_session
from app.services.risk_assessor import RiskAssessor
from app.models.risk import RiskCreateRequest, RiskResponse

router = APIRouter(prefix="/api/compliance/risks", tags=["risks"])

@router.post("", response_model=RiskResponse)
async def create_risk(
    request: Request,
    payload: RiskCreateRequest,
    session: AsyncSession = Depends(get_operational_session)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    tenant_id = getattr(request.state, "tenant_id", "default")
    assessor = RiskAssessor(session)
    risk_dict = await assessor.register_risk(tenant_id, payload)
    return RiskResponse(**risk_dict)

@router.get("", response_model=List[RiskResponse])
async def list_risks(
    request: Request,
    session: AsyncSession = Depends(get_operational_session)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    tenant_id = getattr(request.state, "tenant_id", "default")
    assessor = RiskAssessor(session)
    risks = await assessor.get_risk_register(tenant_id)
    return [RiskResponse(**r) for r in risks]
