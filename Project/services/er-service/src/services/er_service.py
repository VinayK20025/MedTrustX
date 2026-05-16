"""
MedTrustX Emergency (ER) Service — Business Logic Layer

Implements the core ER workflow engine:
  - Case registration & lifecycle management
  - Triage assessment with ESI-based priority scoring
  - Staff assignment & resource allocation
  - Real-time priority queue management
  - Event logging for audit trail

Design Principles:
  - Every write operation triggers a domain event via Kafka
  - All queries are tenant-scoped (RLS via app.tenant_id)
  - Soft-delete pattern for data retention compliance
  - Priority queue auto-recalculates on triage changes
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.er import (
    EmergencyCase,
    ERAssignment,
    EREvent,
    ERQueue,
    TriageRecord,
)
from src.schemas.er import (
    EmergencyCaseCreate,
    EmergencyCaseUpdate,
    ERAssignmentCreate,
    EREventCreate,
    TriageRecordCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Severity → Priority mapping (ESI-based) ────────────────────
_SEVERITY_TO_PRIORITY = {
    "critical": 1,
    "high": 2,
    "medium": 3,
    "low": 4,
    "non_urgent": 5,
}

_PRIORITY_TO_CATEGORY = {
    1: "resuscitation",
    2: "emergent",
    3: "urgent",
    4: "less_urgent",
    5: "non_urgent",
}


# ═══════════════════════════════════════════════════════════════
#  Emergency Cases
# ═══════════════════════════════════════════════════════════════

async def create_case(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: EmergencyCaseCreate,
) -> EmergencyCase:
    """
    Register a new emergency case.

    Creates the case, adds it to the priority queue, and logs
    a CASE_REGISTERED event. Emits ER_CASE_CREATED to Kafka.
    """
    case = EmergencyCase(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        severity_level=data.severity_level,
        chief_complaint=data.chief_complaint,
        mode_of_arrival=data.mode_of_arrival,
        er_unit=data.er_unit,
    )
    session.add(case)
    await session.flush()

    # Auto-add to priority queue
    priority = _SEVERITY_TO_PRIORITY.get(data.severity_level, 3)
    queue_entry = ERQueue(
        tenant_id=tenant_id,
        case_id=case.id,
        priority=priority,
        status="waiting",
    )
    session.add(queue_entry)

    # Log registration event
    event = EREvent(
        tenant_id=tenant_id,
        case_id=case.id,
        event_type="CASE_REGISTERED",
        description=f"Patient arrived via {data.mode_of_arrival}, severity: {data.severity_level}",
        metadata={
            "severity_level": data.severity_level,
            "mode_of_arrival": data.mode_of_arrival,
            "chief_complaint": data.chief_complaint,
        },
    )
    session.add(event)
    await session.flush()

    logger.info(
        "er_case_created",
        case_id=str(case.id),
        patient_id=str(data.patient_id),
        severity=data.severity_level,
        tenant_id=str(tenant_id),
    )

    await publish_event(
        "ER_CASE_CREATED",
        case_id=case.id,
        tenant_id=tenant_id,
        payload={
            "patient_id": str(data.patient_id),
            "severity_level": data.severity_level,
            "mode_of_arrival": data.mode_of_arrival,
        },
    )

    return case


async def get_case(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    case_id: uuid.UUID,
) -> Optional[EmergencyCase]:
    """Get a single emergency case with all nested relationships."""
    result = await session.execute(
        select(EmergencyCase)
        .options(
            selectinload(EmergencyCase.triage_records),
            selectinload(EmergencyCase.assignments),
            selectinload(EmergencyCase.events),
            selectinload(EmergencyCase.queue_entry),
        )
        .where(
            and_(
                EmergencyCase.id == case_id,
                EmergencyCase.tenant_id == tenant_id,
                EmergencyCase.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def list_cases(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    *,
    status: Optional[str] = None,
    severity_level: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[EmergencyCase], int]:
    """List emergency cases with filtering and pagination."""
    base_query = select(EmergencyCase).where(
        and_(
            EmergencyCase.tenant_id == tenant_id,
            EmergencyCase.deleted_at.is_(None),
        )
    )

    if status:
        base_query = base_query.where(EmergencyCase.status == status)
    if severity_level:
        base_query = base_query.where(EmergencyCase.severity_level == severity_level)

    # Count total
    count_result = await session.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = count_result.scalar() or 0

    # Fetch page
    offset = (page - 1) * page_size
    result = await session.execute(
        base_query
        .order_by(EmergencyCase.arrival_time.desc())
        .limit(page_size)
        .offset(offset)
    )
    cases = list(result.scalars().all())

    return cases, total


async def update_case(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    case_id: uuid.UUID,
    data: EmergencyCaseUpdate,
) -> Optional[EmergencyCase]:
    """
    Update emergency case fields.

    Handles status transitions, severity changes (with queue recalculation),
    doctor assignment, and disposition recording.
    """
    case = await get_case(session, tenant_id, case_id)
    if not case:
        return None

    changes: dict = {}

    # Status transition
    if data.status and data.status != case.status:
        old_status = case.status
        case.status = data.status
        changes["old_status"] = old_status
        changes["new_status"] = data.status

        # Terminal states → close the case
        if data.status in ("discharged", "admitted", "transferred", "deceased"):
            case.discharge_time = datetime.now(timezone.utc)

            # Remove from queue
            if case.queue_entry:
                case.queue_entry.status = "completed"

            await publish_event(
                "ER_CASE_CLOSED",
                case_id=case.id,
                tenant_id=tenant_id,
                payload={
                    "patient_id": str(case.patient_id),
                    "disposition": data.disposition or data.status,
                    "final_status": data.status,
                },
            )

        # In-treatment → update queue
        elif data.status == "in_treatment" and case.queue_entry:
            case.queue_entry.status = "in_treatment"

    # Severity change → recalculate queue priority
    if data.severity_level and data.severity_level != case.severity_level:
        old_severity = case.severity_level
        case.severity_level = data.severity_level
        changes["old_severity"] = old_severity
        changes["new_severity"] = data.severity_level

        # Update queue priority
        if case.queue_entry and case.queue_entry.status == "waiting":
            new_priority = _SEVERITY_TO_PRIORITY.get(data.severity_level, 3)
            case.queue_entry.priority = new_priority

            await publish_event(
                "ER_QUEUE_UPDATED",
                case_id=case.id,
                tenant_id=tenant_id,
                payload={
                    "new_priority": new_priority,
                    "severity_level": data.severity_level,
                },
            )

        # Escalation detection
        if _SEVERITY_TO_PRIORITY.get(data.severity_level, 3) < _SEVERITY_TO_PRIORITY.get(old_severity, 3):
            await publish_event(
                "ER_CASE_ESCALATED",
                case_id=case.id,
                tenant_id=tenant_id,
                payload={
                    "patient_id": str(case.patient_id),
                    "old_severity": old_severity,
                    "new_severity": data.severity_level,
                },
            )

    # Doctor assignment
    if data.assigned_doctor is not None:
        case.assigned_doctor = data.assigned_doctor
        changes["assigned_doctor"] = str(data.assigned_doctor)

    # Disposition
    if data.disposition:
        case.disposition = data.disposition
        changes["disposition"] = data.disposition

    # ER unit transfer
    if data.er_unit:
        case.er_unit = data.er_unit
        changes["er_unit"] = data.er_unit

    case.updated_at = datetime.now(timezone.utc)
    await session.flush()

    # Log status change event
    if changes:
        event = EREvent(
            tenant_id=tenant_id,
            case_id=case.id,
            event_type="STATUS_CHANGED",
            description=f"Case updated: {', '.join(f'{k}={v}' for k, v in changes.items())}",
            metadata=changes,
        )
        session.add(event)
        await session.flush()

        await publish_event(
            "ER_STATUS_CHANGED",
            case_id=case.id,
            tenant_id=tenant_id,
            payload=changes,
        )

    return case


# ═══════════════════════════════════════════════════════════════
#  Triage
# ═══════════════════════════════════════════════════════════════

async def create_triage(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    case_id: uuid.UUID,
    data: TriageRecordCreate,
    triaged_by: Optional[uuid.UUID] = None,
) -> TriageRecord:
    """
    Perform triage assessment on an emergency case.

    - Records vitals, symptoms, and priority score
    - Updates the case severity based on triage
    - Recalculates queue priority
    - Transitions case to 'triaged' status if currently 'registered'
    """
    case = await get_case(session, tenant_id, case_id)
    if not case:
        raise ValueError("Emergency case not found")

    # Derive triage category if not provided
    triage_category = data.triage_category or _PRIORITY_TO_CATEGORY.get(
        data.priority_score, "urgent"
    )

    # Serialize vitals
    vitals_dict = data.vitals.model_dump(exclude_none=True) if data.vitals else None

    triage = TriageRecord(
        tenant_id=tenant_id,
        case_id=case_id,
        symptoms=data.symptoms,
        vitals=vitals_dict,
        priority_score=data.priority_score,
        triage_category=triage_category,
        triaged_by=triaged_by,
        notes=data.notes,
    )
    session.add(triage)

    # Map priority score to severity
    priority_to_severity = {v: k for k, v in _SEVERITY_TO_PRIORITY.items()}
    new_severity = priority_to_severity.get(data.priority_score, "medium")

    # Update case severity and status
    if case.severity_level != new_severity:
        case.severity_level = new_severity

    if case.status == "registered":
        case.status = "triaged"

    case.updated_at = datetime.now(timezone.utc)

    # Update queue priority
    if case.queue_entry and case.queue_entry.status == "waiting":
        case.queue_entry.priority = data.priority_score
        case.queue_entry.updated_at = datetime.now(timezone.utc)

    # Log triage event
    event = EREvent(
        tenant_id=tenant_id,
        case_id=case_id,
        event_type="TRIAGE_COMPLETED",
        description=f"Triage completed: priority={data.priority_score}, category={triage_category}",
        metadata={
            "priority_score": data.priority_score,
            "triage_category": triage_category,
            "severity_level": new_severity,
            "vitals": vitals_dict,
        },
        actor_id=triaged_by,
    )
    session.add(event)
    await session.flush()

    logger.info(
        "triage_completed",
        case_id=str(case_id),
        priority_score=data.priority_score,
        severity=new_severity,
    )

    await publish_event(
        "TRIAGE_COMPLETED",
        case_id=case_id,
        tenant_id=tenant_id,
        payload={
            "patient_id": str(case.patient_id),
            "priority_score": data.priority_score,
            "severity_level": new_severity,
            "triage_category": triage_category,
        },
    )

    return triage


async def get_triage_records(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    case_id: uuid.UUID,
) -> List[TriageRecord]:
    """Get all triage records for a case (most recent first)."""
    result = await session.execute(
        select(TriageRecord)
        .where(
            and_(
                TriageRecord.case_id == case_id,
                TriageRecord.tenant_id == tenant_id,
                TriageRecord.deleted_at.is_(None),
            )
        )
        .order_by(TriageRecord.triaged_at.desc())
    )
    return list(result.scalars().all())


# ═══════════════════════════════════════════════════════════════
#  Staff Assignments
# ═══════════════════════════════════════════════════════════════

async def assign_staff(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    case_id: uuid.UUID,
    data: ERAssignmentCreate,
) -> ERAssignment:
    """
    Assign a staff member to an emergency case.

    - If role is 'attending_doctor', also updates EmergencyCase.assigned_doctor
    - Logs DOCTOR_ASSIGNED event
    - Emits ER_CASE_ASSIGNED to Kafka
    """
    case = await get_case(session, tenant_id, case_id)
    if not case:
        raise ValueError("Emergency case not found")

    assignment = ERAssignment(
        tenant_id=tenant_id,
        case_id=case_id,
        staff_id=data.staff_id,
        role=data.role,
    )
    session.add(assignment)

    # If attending doctor, update case
    if data.role == "attending_doctor":
        case.assigned_doctor = data.staff_id
        case.updated_at = datetime.now(timezone.utc)

    # Log event
    event = EREvent(
        tenant_id=tenant_id,
        case_id=case_id,
        event_type="DOCTOR_ASSIGNED" if "doctor" in data.role else "STAFF_ASSIGNED",
        description=f"{data.role} assigned: {data.staff_id}",
        metadata={
            "staff_id": str(data.staff_id),
            "role": data.role,
        },
    )
    session.add(event)
    await session.flush()

    logger.info(
        "er_staff_assigned",
        case_id=str(case_id),
        staff_id=str(data.staff_id),
        role=data.role,
    )

    await publish_event(
        "ER_CASE_ASSIGNED",
        case_id=case_id,
        tenant_id=tenant_id,
        payload={
            "patient_id": str(case.patient_id),
            "staff_id": str(data.staff_id),
            "role": data.role,
            "severity_level": case.severity_level,
        },
    )

    return assignment


# ═══════════════════════════════════════════════════════════════
#  Priority Queue
# ═══════════════════════════════════════════════════════════════

async def get_queue(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    *,
    status_filter: Optional[str] = None,
) -> Tuple[List[ERQueue], int, int]:
    """
    Get the real-time ER priority queue.

    Returns entries ordered by priority (ascending = highest first),
    then by wait_start (ascending = longest waiting first).

    Returns: (entries, total_waiting, total_in_treatment)
    """
    query = (
        select(ERQueue)
        .options(selectinload(ERQueue.emergency_case))
        .where(
            and_(
                ERQueue.tenant_id == tenant_id,
                ERQueue.deleted_at.is_(None),
                ERQueue.status != "completed",
            )
        )
    )

    if status_filter:
        query = query.where(ERQueue.status == status_filter)

    query = query.order_by(ERQueue.priority.asc(), ERQueue.wait_start.asc())

    result = await session.execute(query)
    entries = list(result.scalars().all())

    # Count totals
    total_waiting = sum(1 for e in entries if e.status == "waiting")
    total_in_treatment = sum(1 for e in entries if e.status == "in_treatment")

    return entries, total_waiting, total_in_treatment


# ═══════════════════════════════════════════════════════════════
#  Event Log
# ═══════════════════════════════════════════════════════════════

async def create_event(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    case_id: uuid.UUID,
    data: EREventCreate,
    actor_id: Optional[uuid.UUID] = None,
) -> EREvent:
    """Log a custom event against an emergency case."""
    case = await get_case(session, tenant_id, case_id)
    if not case:
        raise ValueError("Emergency case not found")

    event = EREvent(
        tenant_id=tenant_id,
        case_id=case_id,
        event_type=data.event_type,
        description=data.description,
        metadata=data.metadata,
        actor_id=actor_id,
    )
    session.add(event)
    await session.flush()

    logger.info(
        "er_event_logged",
        case_id=str(case_id),
        event_type=data.event_type,
    )

    return event


async def get_events(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    case_id: uuid.UUID,
) -> List[EREvent]:
    """Get all events for a case (most recent first)."""
    result = await session.execute(
        select(EREvent)
        .where(
            and_(
                EREvent.case_id == case_id,
                EREvent.tenant_id == tenant_id,
                EREvent.deleted_at.is_(None),
            )
        )
        .order_by(EREvent.created_at.desc())
    )
    return list(result.scalars().all())
