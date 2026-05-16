"""
MedTrustX Diagnostics Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.diagnostics import DiagnosticOrder, ImagingResult, Result, Sample
from src.schemas.diagnostics import (
    DiagnosticOrderCreate,
    DiagnosticOrderUpdate,
    ImagingResultCreate,
    ResultCreate,
    SampleCreate,
    SampleUpdate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Orders ──────────────────────────────────────────────────────
async def create_order(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    data: DiagnosticOrderCreate,
) -> DiagnosticOrder:
    order = DiagnosticOrder(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        order_type=data.order_type,
        test_name=data.test_name,
        priority=data.priority,
        ordered_by=user_id,
    )
    session.add(order)
    await session.flush()

    await publish_event(
        "DIAGNOSTIC_ORDER_CREATED",
        order_id=order.id,
        patient_id=data.patient_id,
        tenant_id=tenant_id,
        payload={"order_type": data.order_type, "test_name": data.test_name},
    )
    return order


async def get_order(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    order_id: uuid.UUID,
    load_relations: bool = False,
) -> Optional[DiagnosticOrder]:
    stmt = select(DiagnosticOrder).where(
        and_(
            DiagnosticOrder.id == order_id,
            DiagnosticOrder.tenant_id == tenant_id,
            DiagnosticOrder.deleted_at.is_(None),
        )
    )
    if load_relations:
        stmt = stmt.options(
            selectinload(DiagnosticOrder.samples),
            selectinload(DiagnosticOrder.results),
            selectinload(DiagnosticOrder.imaging_results),
        )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def update_order(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    order_id: uuid.UUID,
    data: DiagnosticOrderUpdate,
) -> Optional[DiagnosticOrder]:
    order = await get_order(session, tenant_id, order_id)
    if not order:
        return None

    if data.status != order.status:
        order.status = data.status
        order.updated_at = datetime.now(timezone.utc)
        await session.flush()

    return order


# ── Samples ─────────────────────────────────────────────────────
async def add_sample(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    order_id: uuid.UUID,
    data: SampleCreate,
) -> Optional[Sample]:
    order = await get_order(session, tenant_id, order_id)
    if not order:
        return None

    sample = Sample(
        tenant_id=tenant_id,
        order_id=order_id,
        sample_type=data.sample_type,
        barcode=data.barcode,
    )
    session.add(sample)
    await session.flush()
    return sample


async def update_sample(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    order_id: uuid.UUID,
    sample_id: uuid.UUID,
    user_id: uuid.UUID,
    data: SampleUpdate,
) -> Optional[Sample]:
    result = await session.execute(
        select(Sample).where(
            and_(
                Sample.id == sample_id,
                Sample.order_id == order_id,
                Sample.tenant_id == tenant_id,
                Sample.deleted_at.is_(None),
            )
        )
    )
    sample = result.scalar_one_or_none()
    if not sample:
        return None

    sample.status = data.status
    if data.barcode:
        sample.barcode = data.barcode
    if data.rejection_reason:
        sample.rejection_reason = data.rejection_reason

    if data.status == "collected":
        sample.collected_at = datetime.now(timezone.utc)
        sample.collected_by = user_id
        
        # Also get the order to publish event
        order = await get_order(session, tenant_id, order_id)
        if order:
            await publish_event(
                "SAMPLE_COLLECTED",
                order_id=order_id,
                patient_id=order.patient_id,
                tenant_id=tenant_id,
                payload={"sample_id": str(sample.id), "sample_type": sample.sample_type},
            )

    sample.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return sample


# ── Results ─────────────────────────────────────────────────────
async def add_result(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    order_id: uuid.UUID,
    data: ResultCreate,
) -> Optional[Result]:
    order = await get_order(session, tenant_id, order_id)
    if not order:
        return None

    result_record = Result(
        tenant_id=tenant_id,
        order_id=order_id,
        patient_id=order.patient_id,
        parameter_name=data.parameter_name,
        value=data.value,
        unit=data.unit,
        reference_range=data.reference_range,
        is_abnormal=data.is_abnormal,
        status=data.status,
    )
    session.add(result_record)
    
    # Auto-update order status if it's still processing or earlier
    if order.status in ("ordered", "collected", "processing"):
        order.status = "completed" if data.status == "final" else "processing"
        order.updated_at = datetime.now(timezone.utc)

    await session.flush()

    await publish_event(
        "RESULT_AVAILABLE",
        order_id=order_id,
        patient_id=order.patient_id,
        tenant_id=tenant_id,
        payload={"result_id": str(result_record.id), "status": data.status},
    )

    return result_record


async def validate_result(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    order_id: uuid.UUID,
    result_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Optional[Result]:
    result_record = await session.execute(
        select(Result).where(
            and_(
                Result.id == result_id,
                Result.order_id == order_id,
                Result.tenant_id == tenant_id,
                Result.deleted_at.is_(None),
            )
        )
    )
    res = result_record.scalar_one_or_none()
    if not res:
        return None

    res.status = "final"
    res.validated_by = user_id
    res.validated_at = datetime.now(timezone.utc)
    res.updated_at = datetime.now(timezone.utc)
    
    await session.flush()

    await publish_event(
        "RESULT_VALIDATED",
        order_id=order_id,
        patient_id=res.patient_id,
        tenant_id=tenant_id,
        payload={"result_id": str(res.id)},
    )
    
    return res


# ── Imaging ─────────────────────────────────────────────────────
async def add_imaging_result(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    order_id: uuid.UUID,
    data: ImagingResultCreate,
) -> Optional[ImagingResult]:
    order = await get_order(session, tenant_id, order_id)
    if not order:
        return None

    img_result = ImagingResult(
        tenant_id=tenant_id,
        order_id=order_id,
        patient_id=order.patient_id,
        image_url=data.image_url,
        report=data.report,
        status=data.status,
    )
    session.add(img_result)
    
    if order.status in ("ordered", "collected", "processing"):
        order.status = "completed" if data.status == "final" else "processing"
        order.updated_at = datetime.now(timezone.utc)

    await session.flush()

    if data.status == "final":
        await publish_event(
            "IMAGING_REPORT_READY",
            order_id=order_id,
            patient_id=order.patient_id,
            tenant_id=tenant_id,
            payload={"imaging_id": str(img_result.id)},
        )

    return img_result


# ── Patient History ─────────────────────────────────────────────
async def get_patient_diagnostics(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[DiagnosticOrder]:
    result = await session.execute(
        select(DiagnosticOrder)
        .where(
            and_(
                DiagnosticOrder.patient_id == patient_id,
                DiagnosticOrder.tenant_id == tenant_id,
                DiagnosticOrder.deleted_at.is_(None),
            )
        )
        .options(
            selectinload(DiagnosticOrder.samples),
            selectinload(DiagnosticOrder.results),
            selectinload(DiagnosticOrder.imaging_results),
        )
        .order_by(desc(DiagnosticOrder.created_at))
    )
    return list(result.scalars().all())
