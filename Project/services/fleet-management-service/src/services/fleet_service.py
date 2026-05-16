"""
MedTrustX Fleet Management Service — Business Logic Layer

Vehicles, drivers, trips, assignments, and tracking.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.fleet import (
    Assignment,
    Driver,
    Trip,
    Vehicle,
    VehicleTracking,
)
from src.schemas.fleet import (
    AssignmentCreate,
    DriverCreate,
    TripCreate,
    VehicleCreate,
    VehicleTrackingCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Vehicles ──

async def register_vehicle(
    session: AsyncSession, tenant_id: uuid.UUID, data: VehicleCreate
) -> Vehicle:
    vehicle = Vehicle(
        tenant_id=tenant_id,
        vehicle_type=data.vehicle_type,
        registration_number=data.registration_number,
    )
    session.add(vehicle)
    await session.flush()
    return vehicle


async def get_vehicle(
    session: AsyncSession, tenant_id: uuid.UUID, vehicle_id: uuid.UUID
) -> Optional[Vehicle]:
    result = await session.execute(
        select(Vehicle).where(and_(Vehicle.id == vehicle_id, Vehicle.tenant_id == tenant_id, Vehicle.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Drivers ──

async def register_driver(
    session: AsyncSession, tenant_id: uuid.UUID, data: DriverCreate
) -> Driver:
    driver = Driver(
        tenant_id=tenant_id,
        user_id=data.user_id,
        license_number=data.license_number,
    )
    session.add(driver)
    await session.flush()
    return driver


async def get_driver(
    session: AsyncSession, tenant_id: uuid.UUID, driver_id: uuid.UUID
) -> Optional[Driver]:
    result = await session.execute(
        select(Driver).where(and_(Driver.id == driver_id, Driver.tenant_id == tenant_id, Driver.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Trips ──

async def create_trip(
    session: AsyncSession, tenant_id: uuid.UUID, data: TripCreate
) -> Trip:
    trip = Trip(
        tenant_id=tenant_id,
        vehicle_id=data.vehicle_id,
        trip_type=data.trip_type,
        start_location=data.start_location,
        end_location=data.end_location,
        started_at=data.started_at,
    )
    session.add(trip)
    await session.flush()
    await publish_event("TRIP_CREATED", tenant_id, trip.id, {"vehicle_id": str(data.vehicle_id), "trip_type": data.trip_type})
    return trip


async def get_trip(
    session: AsyncSession, tenant_id: uuid.UUID, trip_id: uuid.UUID
) -> Optional[Trip]:
    result = await session.execute(
        select(Trip).where(and_(Trip.id == trip_id, Trip.tenant_id == tenant_id, Trip.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Assignments ──

async def assign_driver(
    session: AsyncSession, tenant_id: uuid.UUID, data: AssignmentCreate
) -> Assignment:
    assignment = Assignment(
        tenant_id=tenant_id,
        trip_id=data.trip_id,
        driver_id=data.driver_id,
    )
    session.add(assignment)
    await session.flush()
    
    trip = await get_trip(session, tenant_id, data.trip_id)
    vid = str(trip.vehicle_id) if trip else "unknown"

    await publish_event("VEHICLE_ASSIGNED", tenant_id, assignment.id, {"trip_id": str(data.trip_id), "driver_id": str(data.driver_id), "vehicle_id": vid})
    return assignment


async def get_assignment(
    session: AsyncSession, tenant_id: uuid.UUID, assignment_id: uuid.UUID
) -> Optional[Assignment]:
    result = await session.execute(
        select(Assignment).where(and_(Assignment.id == assignment_id, Assignment.tenant_id == tenant_id, Assignment.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Vehicle Tracking ──

async def log_location(
    session: AsyncSession, tenant_id: uuid.UUID, vehicle_id: uuid.UUID, data: VehicleTrackingCreate
) -> VehicleTracking:
    tracking = VehicleTracking(
        tenant_id=tenant_id,
        vehicle_id=vehicle_id,
        latitude=data.latitude,
        longitude=data.longitude,
    )
    session.add(tracking)
    await session.flush()
    return tracking


async def get_latest_location(
    session: AsyncSession, tenant_id: uuid.UUID, vehicle_id: uuid.UUID
) -> Optional[VehicleTracking]:
    result = await session.execute(
        select(VehicleTracking).where(
            and_(VehicleTracking.vehicle_id == vehicle_id, VehicleTracking.tenant_id == tenant_id, VehicleTracking.deleted_at.is_(None))
        ).order_by(VehicleTracking.recorded_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()
