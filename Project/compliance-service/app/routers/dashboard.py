"""
Compliance Dashboard Stats Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_operational_session
from app.services.gap_analyzer import GapAnalyzer
from app.services.risk_assessor import RiskAssessor

router = APIRouter(prefix="/api/compliance/dashboard", tags=["dashboard"])

@router.get("/summary")
async def get_summary(
    request: Request,
    session: AsyncSession = Depends(get_operational_session)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    tenant_id = getattr(request.state, "tenant_id", "default")
    
    analyzer = GapAnalyzer(session)
    reports = await analyzer.analyze_all(tenant_id)
    
    overall_score = sum(r.compliance_percentage for r in reports) / len(reports) if reports else 100.0
    critical_gaps_total = sum(len(r.critical_gaps) for r in reports)
    
    assessor = RiskAssessor(session)
    risks = await assessor.get_risk_register(tenant_id)
    high_risks = sum(1 for r in risks if r.get("residual_risk_score", 0) > 50)
    
    return {
        "tenant_id": tenant_id,
        "overall_compliance_score": round(overall_score, 2),
        "total_frameworks_evaluated": len(reports),
        "critical_gaps_identified": critical_gaps_total,
        "high_risks_active": high_risks,
        "status": "healthy"
    }
