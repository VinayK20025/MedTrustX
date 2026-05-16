"""
MedTrustX DB Extraction Engine — Query Orchestrator (§3A)

Handles complex extraction requests that span multiple service DBs.
Implements federated query pattern — logical joins via cached refs.
"""
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.connectors.service_connector import ConnectorRegistry
from src.models.derived_tables import PatientSummary, ClinicalInsight

logger = structlog.get_logger()


class QueryOrchestrator:
    """
    Orchestrates complex multi-source queries.
    NEVER does cross-DB joins — uses cached refs and precomputed tables.
    """

    def __init__(self, registry: ConnectorRegistry, local_session_factory):
        self._registry = registry
        self._local_factory = local_session_factory

    async def get_high_risk_patients(self, tenant_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Pattern 3: Precomputed View query.
        Reads from local patient_summary derived table.
        """
        async with self._local_factory() as session:
            await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tenant_id})
            result = await session.execute(
                select(PatientSummary).where(
                    PatientSummary.tenant_id == uuid.UUID(tenant_id) if len(tenant_id) > 10 else text("1=1"),
                    PatientSummary.risk_level == "HIGH",
                ).order_by(PatientSummary.updated_at.desc()).limit(limit)
            )
            rows = result.scalars().all()
            return [{"patient_id": str(r.patient_id), "risk_level": r.risk_level, "status": r.current_status, "ward": r.ward} for r in rows]

    async def get_clinical_insights(self, tenant_id: str, insight_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Query derived clinical insights."""
        async with self._local_factory() as session:
            await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tenant_id})
            stmt = select(ClinicalInsight)
            if insight_type:
                stmt = stmt.where(ClinicalInsight.insight_type == insight_type)
            stmt = stmt.order_by(ClinicalInsight.created_at.desc()).limit(100)
            result = await session.execute(stmt)
            rows = result.scalars().all()
            return [{"patient_id": str(r.patient_id), "type": r.insight_type, "severity": r.severity, "details": r.details} for r in rows]

    async def federated_icu_query(self, tenant_id: str) -> Dict[str, Any]:
        """
        Pattern 2: Federated Query.
        Combines ICU data + patient refs + clinical history via connectors.
        Falls back gracefully if any connector is unavailable.
        """
        result = {"icu_patients": [], "vitals_alerts": 0, "status": "ok", "partial": False}

        # Step 1: Get ICU data from connector
        icu_conn = self._registry.get("icu-service")
        if icu_conn:
            try:
                icu_data = await icu_conn.execute(text("SELECT patient_id, bed_id, status FROM icu_admissions WHERE status = 'active' LIMIT 50"), tenant_id)
                for row in icu_data:
                    result["icu_patients"].append({"patient_id": str(row[0]), "bed_id": str(row[1]), "status": row[2]})
            except Exception as exc:
                logger.warning("icu_connector_failed", error=str(exc)[:200])
                result["partial"] = True

        # Step 2: Enrich with precomputed patient summaries
        async with self._local_factory() as session:
            await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tenant_id})
            for patient in result["icu_patients"]:
                try:
                    ps = await session.execute(
                        select(PatientSummary).where(PatientSummary.patient_id == uuid.UUID(patient["patient_id"]))
                    )
                    summary = ps.scalar_one_or_none()
                    if summary:
                        patient["risk_level"] = summary.risk_level
                        patient["diagnosis"] = summary.diagnosis_summary
                except Exception:
                    patient["risk_level"] = "unknown"

        return result
