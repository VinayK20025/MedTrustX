"""
MedTrustX DB Extraction Engine — Event-Driven Extraction (§6)

Kafka consumer that builds derived tables from upstream events.
"""
import uuid
import json
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.derived_tables import ClinicalInsight, OperationalMetric, PatientSummary, SecurityMetric
from src.transforms.transformers import VitalsTransformer

logger = structlog.get_logger()


async def handle_patient_created(session: AsyncSession, event: dict) -> None:
    """PATIENT_CREATED → upsert patient_summary."""
    data = event.get("data", {})
    tid = uuid.UUID(event["tenant_id"])
    pid = uuid.UUID(event.get("entity_id", data.get("patient_id", str(uuid.uuid4()))))

    existing = await session.execute(select(PatientSummary).where(PatientSummary.patient_id == pid))
    row = existing.scalar_one_or_none()
    if row:
        row.current_status = "active"
        row.updated_at = datetime.now(timezone.utc)
    else:
        session.add(PatientSummary(
            tenant_id=tid, patient_id=pid,
            patient_name=data.get("name", ""),
            risk_level="LOW", current_status="active",
        ))
    await session.flush()
    logger.info("patient_summary_updated", patient_id=str(pid))


async def handle_vitals_recorded(session: AsyncSession, event: dict) -> None:
    """VITALS_RECORDED → update risk_level in patient_summary."""
    data = event.get("data", {})
    tid = uuid.UUID(event["tenant_id"])
    pid = uuid.UUID(data.get("patient_id", str(uuid.uuid4())))

    vitals = {k: v for k, v in data.items() if k in ("systolic_bp", "heart_rate", "spo2", "temperature", "respiratory_rate")}
    assessment = VitalsTransformer.assess_risk(vitals)

    result = await session.execute(select(PatientSummary).where(PatientSummary.patient_id == pid))
    row = result.scalar_one_or_none()
    if row:
        row.risk_level = assessment["risk_level"]
        row.updated_at = datetime.now(timezone.utc)
    else:
        session.add(PatientSummary(tenant_id=tid, patient_id=pid, risk_level=assessment["risk_level"], current_status="active"))
    await session.flush()

    # Generate clinical insight if high risk
    if assessment["risk_level"] == "HIGH":
        session.add(ClinicalInsight(
            tenant_id=tid, patient_id=pid,
            insight_type="vitals_anomaly", severity="high",
            details={"alerts": assessment["alerts"], "score": assessment["risk_score"]},
        ))
        await session.flush()


async def handle_alert_triggered(session: AsyncSession, event: dict) -> None:
    """ALERT_TRIGGERED → update security_metrics."""
    tid = uuid.UUID(event["tenant_id"])
    data = event.get("data", {})
    session.add(SecurityMetric(
        tenant_id=tid, metric_type=data.get("alert_type", "security_alert"),
        count=1, period=datetime.now(timezone.utc).strftime("%Y-%m"),
    ))
    await session.flush()


# Event handler dispatch table
EVENT_HANDLERS = {
    "PATIENT_CREATED": handle_patient_created,
    "PATIENT_ADMITTED": handle_patient_created,
    "VITALS_RECORDED": handle_vitals_recorded,
    "ALERT_TRIGGERED": handle_alert_triggered,
}
