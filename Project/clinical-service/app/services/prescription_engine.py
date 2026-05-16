"""
Prescription Engine with CDS Integration.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
import uuid
from datetime import datetime
import json

from app.db.repositories.medication_repo import MedicationRepository
from app.services.cds_engine import CDSEngine
from app.models.medication import PrescriptionRequest, PrescriptionResult

tracer = trace.get_tracer(__name__)

class PrescriptionEngine:
    def __init__(self, session: AsyncSession, redis_client):
        self.repo = MedicationRepository(session)
        self.redis = redis_client
        self.cds = CDSEngine(session)

    async def prescribe(self, tenant_id: str, req: PrescriptionRequest) -> PrescriptionResult:
        with tracer.start_as_current_span("prescription.create"):
            patient_id = req.patient_id
            active_meds = await self.repo.get_patient_medications(tenant_id, patient_id, status="active")
            
            dose_mg = 0.0
            try:
                dose_mg = float(''.join(c for c in req.dose if c.isdigit() or c == '.'))
            except ValueError:
                pass
                
            alerts = await self.cds.check_prescription(
                tenant_id=tenant_id,
                patient_id=patient_id,
                medication_code=req.medication_code,
                dose_mg=dose_mg,
                active_medications=active_meds
            )
            
            has_blocking_alerts = any(a["severity"] == "CONTRAINDICATED" for a in alerts)
            
            if has_blocking_alerts and not req.override_reason:
                return PrescriptionResult(
                    status="blocked_by_cds",
                    cds_alerts=alerts
                )
                
            data = req.model_dump(exclude={"override_reason"})
            data["id"] = str(uuid.uuid4())
            data["tenant_id"] = tenant_id
            data["status"] = "active"
            data["prescribed_at"] = datetime.utcnow()
            if req.override_reason:
                data["override_reason"] = req.override_reason
                
            record = await self.repo.add_medication(tenant_id, data)
            
            await self.redis.publish("medtrust:clinical:orders", json.dumps({
                "event": "prescription_created",
                "patient_id": patient_id,
                "medication_code": req.medication_code
            }))
            
            return PrescriptionResult(
                prescription_id=record["id"],
                status="created",
                cds_alerts=alerts
            )
