"""
Gap Analysis Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_operational_session
from app.services.gap_analyzer import GapAnalyzer
from app.models.gap import GapReport, MultiFrameworkGapReport

router = APIRouter(prefix="/api/compliance/gaps", tags=["gaps"])

@router.get("/analyze/{framework}", response_model=GapReport)
async def analyze_framework(
    request: Request,
    framework: str,
    session: AsyncSession = Depends(get_operational_session)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    tenant_id = getattr(request.state, "tenant_id", "default")
        
    analyzer = GapAnalyzer(session)
    return await analyzer.analyze_framework(tenant_id, framework)

@router.get("/analyze-all", response_model=MultiFrameworkGapReport)
async def analyze_all(
    request: Request,
    session: AsyncSession = Depends(get_operational_session)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    tenant_id = getattr(request.state, "tenant_id", "default")
        
    analyzer = GapAnalyzer(session)
    reports = await analyzer.analyze_all(tenant_id)
    return MultiFrameworkGapReport(tenant_id=tenant_id, reports=reports)
