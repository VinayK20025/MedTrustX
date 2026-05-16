"""
MedTrustX DB Extraction Engine — Extraction API Routes (§7, §10)

All extraction endpoints — clinical, operational, financial, security.
Every query enforces: WHERE tenant_id = user.tenant_id
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.derived_tables import (
    ClinicalInsight, FinancialSnapshot, OperationalMetric,
    PatientSummary, SecurityMetric,
)

router = APIRouter(prefix="/extract", tags=["DB Extraction Engine"])


def _get_tenant_id(request: Request) -> str:
    tid = getattr(request.state, "tenant_id", None)
    if not tid:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    return str(tid)


# --- §10: Clinical Extractions ---

@router.get("/clinical/high-risk")
async def high_risk_patients(request: Request, limit: int = Query(50, le=200)):
    """High-risk patients — reads from precomputed patient_summary."""
    tid = _get_tenant_id(request)
    from src.main import get_local_session
    async with get_local_session() as session:
        await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tid})
        result = await session.execute(
            select(PatientSummary).where(PatientSummary.risk_level == "HIGH").order_by(PatientSummary.updated_at.desc()).limit(limit)
        )
        rows = result.scalars().all()
        return [{"patient_id": str(r.patient_id), "risk": r.risk_level, "status": r.current_status, "ward": r.ward} for r in rows]


@router.get("/clinical/insights")
async def clinical_insights(request: Request, insight_type: Optional[str] = None):
    """Derived clinical intelligence."""
    tid = _get_tenant_id(request)
    from src.main import get_local_session
    async with get_local_session() as session:
        await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tid})
        stmt = select(ClinicalInsight)
        if insight_type:
            stmt = stmt.where(ClinicalInsight.insight_type == insight_type)
        result = await session.execute(stmt.order_by(ClinicalInsight.created_at.desc()).limit(100))
        rows = result.scalars().all()
        return [{"patient_id": str(r.patient_id), "type": r.insight_type, "severity": r.severity, "details": r.details} for r in rows]


@router.get("/clinical/patient-count")
async def patient_count(request: Request):
    """Pattern 1: Direct Read — simple count."""
    tid = _get_tenant_id(request)
    from src.main import get_local_session
    async with get_local_session() as session:
        await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tid})
        result = await session.execute(select(func.count()).select_from(PatientSummary))
        return {"count": result.scalar() or 0}


# --- §10: Operational Extractions ---

@router.get("/operational/metrics")
async def operational_metrics(request: Request, metric_name: Optional[str] = None):
    """Bed occupancy, staff utilization, etc."""
    tid = _get_tenant_id(request)
    from src.main import get_local_session
    async with get_local_session() as session:
        await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tid})
        stmt = select(OperationalMetric)
        if metric_name:
            stmt = stmt.where(OperationalMetric.metric_name == metric_name)
        result = await session.execute(stmt.order_by(OperationalMetric.timestamp.desc()).limit(100))
        rows = result.scalars().all()
        return [{"metric": r.metric_name, "value": r.value, "dimension": r.dimension, "ts": r.timestamp.isoformat()} for r in rows]


# --- §10: Financial Extractions ---

@router.get("/financial/snapshots")
async def financial_snapshots(request: Request, department: Optional[str] = None):
    """Revenue per department, cost per patient."""
    tid = _get_tenant_id(request)
    from src.main import get_local_session
    async with get_local_session() as session:
        await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tid})
        stmt = select(FinancialSnapshot)
        if department:
            stmt = stmt.where(FinancialSnapshot.department == department)
        result = await session.execute(stmt.order_by(FinancialSnapshot.created_at.desc()).limit(50))
        rows = result.scalars().all()
        return [{"dept": r.department, "revenue": r.revenue, "cost": r.cost, "period": r.period} for r in rows]


# --- §10: Security Extractions ---

@router.get("/security/metrics")
async def security_metrics(request: Request):
    """Incident frequency, access violations."""
    tid = _get_tenant_id(request)
    from src.main import get_local_session
    async with get_local_session() as session:
        await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tid})
        result = await session.execute(select(SecurityMetric).order_by(SecurityMetric.created_at.desc()).limit(100))
        rows = result.scalars().all()
        return [{"type": r.metric_type, "count": r.count, "period": r.period} for r in rows]
