"""
Core Scheduling Engine.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
import uuid
from datetime import datetime
import json
import httpx

from app.db.repositories.appointment_repo import AppointmentRepository
from app.services.conflict_detector import ConflictDetector
from app.models.appointment import AppointmentCreateRequest, AppointmentUpdateRequest
from app.config import settings

tracer = trace.get_tracer(__name__)

class SchedulingEngine:
    def __init__(self, session: AsyncSession, redis_client):
        self.repo = AppointmentRepository(session)
        self.redis = redis_client
        self.conflict_detector = ConflictDetector(session)

    async def schedule(self, tenant_id: str, req: AppointmentCreateRequest) -> Dict[str, Any]:
        with tracer.start_as_current_span("appointment.schedule"):
            has_conflict = await self.conflict_detector.check_provider_conflict(
                tenant_id, req.provider_id, req.start_time, req.end_time
            )
            
            if has_conflict and not req.force_overbook:
                raise ValueError("Provider has a scheduling conflict during this time block")
                
            data = req.model_dump(exclude={"force_overbook"})
            data["id"] = str(uuid.uuid4())
            data["tenant_id"] = tenant_id
            data["status"] = "scheduled"
            data["created_at"] = datetime.utcnow()
            data["updated_at"] = data["created_at"]
            
            appointment = await self.repo.create_appointment(tenant_id, data)
            
            await self.redis.publish("medtrust:operations:appointments", json.dumps({
                "event": "appointment_scheduled",
                "appointment_id": appointment["id"],
                "patient_id": req.patient_id,
                "provider_id": req.provider_id,
                "start_time": req.start_time.isoformat()
            }))
            
            try:
                async with httpx.AsyncClient(timeout=2) as client:
                    await client.post(f"{settings.audit_service_url}/api/audit/events", json={
                        "tenant_id": tenant_id,
                        "user_id": "system",
                        "action": "SCHEDULE",
                        "resource_type": "appointment",
                        "resource_id": appointment["id"],
                        "details": {"patient_id": req.patient_id, "provider_id": req.provider_id},
                        "ip_address": "0.0.0.0"
                    })
            except Exception:
                pass
                
            return appointment

    async def cancel(self, tenant_id: str, appointment_id: str, reason: str) -> Optional[Dict[str, Any]]:
        with tracer.start_as_current_span("appointment.cancel"):
            updates = {"status": "cancelled"}
            appointment = await self.repo.update_appointment(tenant_id, appointment_id, updates)
            
            if appointment:
                await self.redis.publish("medtrust:operations:appointments", json.dumps({
                    "event": "appointment_cancelled",
                    "appointment_id": appointment_id,
                    "patient_id": appointment["patient_id"],
                    "reason": reason
                }))
                
            return appointment

    async def list_for_patient(self, tenant_id: str, patient_id: str) -> List[Dict[str, Any]]:
        return await self.repo.get_patient_appointments(tenant_id, patient_id)
