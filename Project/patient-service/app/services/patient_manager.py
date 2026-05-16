"""
Patient Manager Service.
"""
from typing import Dict, Any, List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
from datetime import datetime

from app.db.repositories.patient_repo import PatientRepository
from app.models.patient import PatientCreateRequest, PatientUpdateRequest

tracer = trace.get_tracer(__name__)

class PatientManager:
    def __init__(self, session: AsyncSession):
        self.repo = PatientRepository(session)

    async def create_patient(self, tenant_id: str, request: PatientCreateRequest, user_id: str) -> Dict[str, Any]:
        with tracer.start_as_current_span("patient.create"):
            existing = await self.repo.get_patient_by_mrn(tenant_id, request.mrn)
            if existing:
                raise ValueError("MRN already exists in this tenant")
                
            data = request.model_dump()
            data["id"] = str(uuid.uuid4())
            data["tenant_id"] = tenant_id
            data["status"] = "active"
            data["created_by"] = user_id
            data["created_at"] = datetime.utcnow()
            
            return await self.repo.create_patient(tenant_id, data)

    async def get_patient(self, tenant_id: str, patient_id: str) -> Optional[Dict[str, Any]]:
        with tracer.start_as_current_span("patient.get"):
            return await self.repo.get_patient_by_id(tenant_id, patient_id)

    async def list_patients(self, tenant_id: str, offset: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        with tracer.start_as_current_span("patient.list"):
            return await self.repo.list_patients(tenant_id, offset, limit)

    async def update_patient(self, tenant_id: str, patient_id: str, request: PatientUpdateRequest) -> Optional[Dict[str, Any]]:
        with tracer.start_as_current_span("patient.update"):
            data = {k: v for k, v in request.model_dump().items() if v is not None}
            if not data:
                return await self.repo.get_patient_by_id(tenant_id, patient_id)
            return await self.repo.update_patient(tenant_id, patient_id, data)

    async def soft_delete(self, tenant_id: str, patient_id: str) -> Optional[Dict[str, Any]]:
        with tracer.start_as_current_span("patient.delete"):
            return await self.repo.update_patient(tenant_id, patient_id, {"status": "inactive"})
