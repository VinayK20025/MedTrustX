"""
Schedule Conflict Detector.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
from datetime import datetime

from app.db.repositories.appointment_repo import AppointmentRepository

tracer = trace.get_tracer(__name__)

class ConflictDetector:
    def __init__(self, session: AsyncSession):
        self.repo = AppointmentRepository(session)

    async def check_provider_conflict(self, tenant_id: str, provider_id: str, start_time: datetime, end_time: datetime, exclude_id: str = None) -> bool:
        with tracer.start_as_current_span("schedule.conflict_check"):
            return await self.repo.check_conflicts(tenant_id, provider_id, start_time, end_time, exclude_id)
