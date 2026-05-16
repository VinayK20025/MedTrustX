"""
MedTrustX Fleet Management Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.fleet import (
    AssignmentCreate, AssignmentResponse,
    DriverCreate, DriverResponse,
    TripCreate, TripResponse,
    VehicleCreate, VehicleResponse,
    VehicleTrackingCreate, VehicleTrackingResponse
)
from src.services import fleet_service

router = APIRouter(tags=["Fleet Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Vehicles ──

@router.post("/vehicles", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def register_vehicle(data: VehicleCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    vehicle = await fleet_service.register_vehicle(session, tid, data)
    await session.commit()
    return vehicle

@router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    vehicle = await fleet_service.get_vehicle(session, tid, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


# ── Drivers ──

@router.post("/drivers", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
async def register_driver(data: DriverCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    driver = await fleet_service.register_driver(session, tid, data)
    await session.commit()
    return driver

@router.get("/drivers/{driver_id}", response_model=DriverResponse)
async def get_driver(driver_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    driver = await fleet_service.get_driver(session, tid, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


# ── Trips ──

@router.post("/trips", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(data: TripCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    trip = await fleet_service.create_trip(session, tid, data)
    await session.commit()
    return trip

@router.get("/trips/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    trip = await fleet_service.get_trip(session, tid, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


# ── Assignments ──

@router.post("/assignments", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def assign_driver(data: AssignmentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    assignment = await fleet_service.assign_driver(session, tid, data)
    await session.commit()
    return assignment

@router.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(assignment_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    assignment = await fleet_service.get_assignment(session, tid, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


# ── Vehicle Tracking ──

@router.post("/vehicles/{vehicle_id}/location", response_model=VehicleTrackingResponse, status_code=status.HTTP_201_CREATED)
async def log_location(vehicle_id: uuid.UUID, data: VehicleTrackingCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    tracking = await fleet_service.log_location(session, tid, vehicle_id, data)
    await session.commit()
    return tracking

@router.get("/vehicles/{vehicle_id}/location", response_model=VehicleTrackingResponse)
async def get_latest_location(vehicle_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    tracking = await fleet_service.get_latest_location(session, tid, vehicle_id)
    if not tracking:
        raise HTTPException(status_code=404, detail="Location not found")
    return tracking
