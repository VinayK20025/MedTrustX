import pytest
from unittest.mock import AsyncMock
from app.services.scheduling_engine import SchedulingEngine
from app.models.appointment import AppointmentCreateRequest
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_appointment_scheduling_no_conflict():
    mock_session = AsyncMock()
    mock_redis = AsyncMock()
    
    engine = SchedulingEngine(mock_session, mock_redis)
    engine.conflict_detector.check_provider_conflict = AsyncMock(return_value=False)
    engine.repo.create_appointment = AsyncMock(return_value={"id": "app-1", "status": "scheduled"})
    
    req = AppointmentCreateRequest(
        patient_id="pat-1",
        provider_id="prov-1",
        appointment_type="consultation",
        start_time=datetime.utcnow() + timedelta(days=1),
        end_time=datetime.utcnow() + timedelta(days=1, hours=1),
        reason="Follow up"
    )
    
    res = await engine.schedule("tenant-1", req)
    assert res["status"] == "scheduled"

@pytest.mark.asyncio
async def test_appointment_conflict_detected():
    mock_session = AsyncMock()
    mock_redis = AsyncMock()
    
    engine = SchedulingEngine(mock_session, mock_redis)
    engine.conflict_detector.check_provider_conflict = AsyncMock(return_value=True)
    
    req = AppointmentCreateRequest(
        patient_id="pat-1",
        provider_id="prov-1",
        appointment_type="consultation",
        start_time=datetime.utcnow(),
        end_time=datetime.utcnow() + timedelta(hours=1),
        reason="Follow up"
    )
    
    with pytest.raises(ValueError):
        await engine.schedule("tenant-1", req)
