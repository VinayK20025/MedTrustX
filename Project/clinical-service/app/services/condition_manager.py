"""
Condition Manager Service.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
import re
import httpx
from datetime import datetime
import uuid

from app.db.repositories.condition_repo import ConditionRepository
from app.config import settings

tracer = trace.get_tracer(__name__)

class ConditionManager:
    def __init__(self, session: AsyncSession):
        self.repo = ConditionRepository(session)
        self.ai_url = settings.ai_service_url

    def _validate_icd10(self, code: str) -> bool:
        if not code: return True
        return bool(re.match(r"^[A-Z][0-9][0-9A-Z](\.[0-9A-Z]{1,4})?$", code))

    def _validate_snomed(self, code: str) -> bool:
        if not code: return True
        return code.isdigit()

    async def diagnose(self, tenant_id: str, payload: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        with tracer.start_as_current_span("condition.diagnose"):
            if not self._validate_icd10(payload.get("icd10_code")):
                raise ValueError("Invalid ICD-10 format")
            if not self._validate_snomed(payload.get("snomed_code")):
                raise ValueError("Invalid SNOMED format")
                
            data = payload.copy()
            data["id"] = str(uuid.uuid4())
            data["tenant_id"] = tenant_id
            data["status"] = "active"
            data["created_at"] = datetime.utcnow()
            
            data["comorbidity_score"] = 2 if payload.get("severity") == "high" else 1
            
            condition = await self.repo.add_condition(tenant_id, data)
            
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(f"{self.ai_url}/api/ai/readmission/update", json={
                        "patient_id": data["patient_id"],
                        "new_condition": condition
                    })
            except Exception:
                pass
                
            return condition

    async def list_conditions(self, tenant_id: str, patient_id: str, status: str = "all") -> List[Dict[str, Any]]:
        return await self.repo.get_patient_conditions(tenant_id, patient_id, status)
