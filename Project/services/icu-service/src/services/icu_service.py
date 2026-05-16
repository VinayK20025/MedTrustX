"""
MedTrustX ICU Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.icu import DeviceData, ICUAlert, ICUPatient, ICUVitals
from src.schemas.icu import (
    DeviceDataCreate,
    ICUAlertCreate,
    ICUPatientCreate,
    ICUPatientUpdate,
    ICUVitalsBatchCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── ICU Admissions ──────────────────────────────────────────────
async def admit_patient(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: ICUPatientCreate,
) -> ICUPatient:
    patient = ICUPatient(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        bed_id=data.bed_id,
    )
    session.add(patient)
    await session.flush()

    await publish_event(
        "ICU_PATIENT_ADMITTED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"icu_record_id": str(patient.id), "bed_id": str(data.bed_id) if data.bed_id else None},
    )
    return patient


async def get_icu_patient(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    record_id: uuid.UUID,
) -> Optional[ICUPatient]:
    result = await session.execute(
        select(ICUPatient).where(
            and_(
                ICUPatient.id == record_id,
                ICUPatient.tenant_id == tenant_id,
                ICUPatient.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_icu_patient(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    record_id: uuid.UUID,
    data: ICUPatientUpdate,
) -> Optional[ICUPatient]:
    patient = await get_icu_patient(session, tenant_id, record_id)
    if not patient:
        return None

    if data.status != patient.status:
        patient.status = data.status
        patient.updated_at = datetime.now(timezone.utc)
        await session.flush()
        
    return patient


# ── Vitals Streaming ────────────────────────────────────────────
async def ingest_vitals_batch(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: ICUVitalsBatchCreate,
) -> int:
    """Ingest a batch of high-frequency vitals and publish stream event."""
    vitals_records = []
    for vital_data in data.vitals:
        record = ICUVitals(
            tenant_id=tenant_id,
            patient_id=data.patient_id,
            metric=vital_data.metric,
            value=vital_data.value,
            recorded_at=vital_data.recorded_at or datetime.now(timezone.utc),
        )
        vitals_records.append(record)
    
    session.add_all(vitals_records)
    await session.flush()

    # Fire lightweight fire-and-forget event for downstream processors
    await publish_event(
        "VITALS_STREAM_RECEIVED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"batch_size": len(vitals_records)},
    )
    
    return len(vitals_records)


async def get_patient_vitals_stream(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    limit: int = 100,
) -> List[ICUVitals]:
    result = await session.execute(
        select(ICUVitals)
        .where(
            and_(
                ICUVitals.patient_id == patient_id,
                ICUVitals.tenant_id == tenant_id,
            )
        )
        .order_by(desc(ICUVitals.recorded_at))
        .limit(limit)
    )
    return list(result.scalars().all())


# ── Device Data ─────────────────────────────────────────────────
async def ingest_device_data(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: DeviceDataCreate,
) -> DeviceData:
    device_record = DeviceData(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        device_id=data.device_id,
        data=data.data,
        recorded_at=data.recorded_at or datetime.now(timezone.utc),
    )
    session.add(device_record)
    await session.flush()

    await publish_event(
        "DEVICE_DATA_INGESTED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"device_id": str(data.device_id)},
    )
    return device_record


# ── Alerts ──────────────────────────────────────────────────────
async def trigger_alert(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: ICUAlertCreate,
) -> ICUAlert:
    alert = ICUAlert(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        alert_type=data.alert_type,
        severity=data.severity,
        message=data.message,
    )
    session.add(alert)
    await session.flush()

    await publish_event(
        "CRITICAL_ALERT_TRIGGERED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={
            "alert_id": str(alert.id),
            "severity": data.severity,
            "type": data.alert_type,
        },
    )
    return alert


async def resolve_alert(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    alert_id: uuid.UUID,
) -> Optional[ICUAlert]:
    result = await session.execute(
        select(ICUAlert).where(
            and_(
                ICUAlert.id == alert_id,
                ICUAlert.tenant_id == tenant_id,
                ICUAlert.deleted_at.is_(None),
            )
        )
    )
    alert = result.scalar_one_or_none()
    if not alert:
        return None

    if alert.resolved_at is None:
        alert.resolved_at = datetime.now(timezone.utc)
        alert.updated_at = datetime.now(timezone.utc)
        await session.flush()

        await publish_event(
            "ALERT_RESOLVED",
            tenant_id=tenant_id,
            patient_id=alert.patient_id,
            payload={"alert_id": str(alert.id)},
        )

    return alert


async def get_patient_alerts(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    active_only: bool = True,
) -> List[ICUAlert]:
    query = select(ICUAlert).where(
        and_(
            ICUAlert.patient_id == patient_id,
            ICUAlert.tenant_id == tenant_id,
            ICUAlert.deleted_at.is_(None),
        )
    )
    if active_only:
        query = query.where(ICUAlert.resolved_at.is_(None))
        
    query = query.order_by(desc(ICUAlert.triggered_at))
    result = await session.execute(query)
    return list(result.scalars().all())
