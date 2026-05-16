"""
MedTrustX Devices & IoMT Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.device import Device, DeviceAlert, DeviceAssignment, DeviceTelemetry
from src.schemas.device import (
    DeviceAlertCreate,
    DeviceAssignRequest,
    DeviceCreate,
    DeviceUpdate,
    TelemetryBatchRequest,
)
from src.services.event_publisher import TOPIC_EVENTS, publish_event, publish_telemetry_batch

logger = structlog.get_logger()


# ── Device Registry ─────────────────────────────────────────────
async def register_device(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: DeviceCreate,
) -> Device:
    device = Device(
        tenant_id=tenant_id,
        device_type=data.device_type,
        manufacturer=data.manufacturer,
        model=data.model,
    )
    session.add(device)
    await session.flush()

    await publish_event(
        "DEVICE_REGISTERED",
        tenant_id=tenant_id,
        device_id=device.id,
        payload={"device_type": data.device_type},
    )
    return device


async def get_device(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    device_id: uuid.UUID,
) -> Optional[Device]:
    result = await session.execute(
        select(Device).where(
            and_(
                Device.id == device_id,
                Device.tenant_id == tenant_id,
                Device.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_device_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    device_id: uuid.UUID,
    data: DeviceUpdate,
) -> Optional[Device]:
    device = await get_device(session, tenant_id, device_id)
    if not device:
        return None

    if data.status != device.status:
        device.status = data.status
        device.updated_at = datetime.now(timezone.utc)
        await session.flush()
        
        await publish_event(
            "DEVICE_STATUS_CHANGED",
            tenant_id=tenant_id,
            device_id=device.id,
            payload={"status": data.status},
        )

    return device


# ── Assignments ─────────────────────────────────────────────────
async def get_active_assignment(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    device_id: uuid.UUID,
) -> Optional[DeviceAssignment]:
    result = await session.execute(
        select(DeviceAssignment).where(
            and_(
                DeviceAssignment.device_id == device_id,
                DeviceAssignment.tenant_id == tenant_id,
                DeviceAssignment.unassigned_at.is_(None),
                DeviceAssignment.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def assign_device(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    device_id: uuid.UUID,
    data: DeviceAssignRequest,
) -> DeviceAssignment:
    # Check for existing active assignment
    active = await get_active_assignment(session, tenant_id, device_id)
    if active:
        # Auto-unassign if needed, or raise. Let's raise to prevent mistakes.
        if active.patient_id != data.patient_id:
            raise ValueError("Device is currently assigned to another patient.")
        return active

    assignment = DeviceAssignment(
        tenant_id=tenant_id,
        device_id=device_id,
        patient_id=data.patient_id,
    )
    session.add(assignment)
    await session.flush()

    await publish_event(
        "DEVICE_ASSIGNED",
        tenant_id=tenant_id,
        device_id=device_id,
        payload={"patient_id": str(data.patient_id)},
    )
    return assignment


async def unassign_device(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    device_id: uuid.UUID,
) -> Optional[DeviceAssignment]:
    active = await get_active_assignment(session, tenant_id, device_id)
    if not active:
        return None

    active.unassigned_at = datetime.now(timezone.utc)
    active.updated_at = active.unassigned_at
    await session.flush()

    await publish_event(
        "DEVICE_UNASSIGNED",
        tenant_id=tenant_id,
        device_id=device_id,
        payload={"patient_id": str(active.patient_id)},
    )
    return active


# ── Telemetry Ingestion ─────────────────────────────────────────
async def ingest_telemetry(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    device_id: uuid.UUID,
    data: TelemetryBatchRequest,
) -> int:
    """
    Ingests a high-frequency array of telemetry points.
    Returns the number of points processed.
    """
    # 1. Resolve patient context
    active_assignment = await get_active_assignment(session, tenant_id, device_id)
    patient_id = active_assignment.patient_id if active_assignment else None

    # 2. Batch insert to DB (in a real system, this goes to TimescaleDB or similar)
    # We do a fast flush of the payload.
    batch_records = []
    kafka_payload = []
    
    for point in data.data:
        record = DeviceTelemetry(
            tenant_id=tenant_id,
            device_id=device_id,
            metric=point.metric,
            value=point.value,
            recorded_at=point.recorded_at,
        )
        batch_records.append(record)
        kafka_payload.append({
            "metric": point.metric,
            "value": point.value,
            "recorded_at": point.recorded_at.isoformat()
        })

    session.add_all(batch_records)
    # Don't commit here, router will commit.

    # 3. Stream to Kafka for ICU / Analytics
    await publish_telemetry_batch(
        tenant_id=tenant_id,
        device_id=device_id,
        patient_id=patient_id,
        batch=kafka_payload,
    )

    return len(batch_records)


# ── Alerts ──────────────────────────────────────────────────────
async def trigger_alert(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    device_id: uuid.UUID,
    data: DeviceAlertCreate,
) -> DeviceAlert:
    alert = DeviceAlert(
        tenant_id=tenant_id,
        device_id=device_id,
        alert_type=data.alert_type,
        severity=data.severity,
        message=data.message,
    )
    session.add(alert)
    await session.flush()

    # Get active assignment to tag the alert contextually
    active_assignment = await get_active_assignment(session, tenant_id, device_id)
    patient_id = active_assignment.patient_id if active_assignment else None

    await publish_event(
        "DEVICE_ALERT_TRIGGERED",
        tenant_id=tenant_id,
        device_id=device_id,
        payload={
            "alert_id": str(alert.id),
            "severity": data.severity,
            "patient_id": str(patient_id) if patient_id else None,
        },
    )
    return alert


async def resolve_alert(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    device_id: uuid.UUID,
    alert_id: uuid.UUID,
) -> Optional[DeviceAlert]:
    result = await session.execute(
        select(DeviceAlert).where(
            and_(
                DeviceAlert.id == alert_id,
                DeviceAlert.device_id == device_id,
                DeviceAlert.tenant_id == tenant_id,
                DeviceAlert.deleted_at.is_(None),
            )
        )
    )
    alert = result.scalar_one_or_none()
    if not alert or alert.resolved_at:
        return alert

    alert.resolved_at = datetime.now(timezone.utc)
    alert.updated_at = alert.resolved_at
    await session.flush()

    await publish_event(
        "DEVICE_ALERT_RESOLVED",
        tenant_id=tenant_id,
        device_id=device_id,
        payload={"alert_id": str(alert.id)},
    )
    return alert
