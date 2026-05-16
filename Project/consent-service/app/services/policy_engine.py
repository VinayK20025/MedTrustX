"""
Consent Policy Enforcement Engine.
"""
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
from datetime import datetime, timezone

from app.services.consent_manager import ConsentManager

tracer = trace.get_tracer(__name__)

class ConsentPolicyEngine:
    def __init__(self, session: AsyncSession):
        self.manager = ConsentManager(session)

    async def verify_access(self, tenant_id: str, patient_id: str, purpose: str, required_elements: List[str]) -> Dict[str, Any]:
        with tracer.start_as_current_span("consent.policy.verify"):
            active_consents = await self.manager.get_patient_consents(patient_id, tenant_id)
            
            valid_consents = []
            reasons = []
            
            now = datetime.now(timezone.utc)
            
            for consent in active_consents:
                if consent["purpose"] != purpose and consent["purpose"] != "*":
                    continue
                    
                vu = consent["valid_until"]
                if vu.tzinfo is None:
                    vu = vu.replace(tzinfo=timezone.utc)
                    
                if vu < now:
                    continue
                    
                has_elements = True
                ce = consent.get("data_elements", [])
                if "*" not in ce:
                    for el in required_elements:
                        if el not in ce:
                            has_elements = False
                            break
                            
                if has_elements:
                    valid_consents.append(str(consent["id"]))
                    
            if valid_consents:
                return {"is_valid": True, "consent_ids": valid_consents}
            else:
                return {"is_valid": False, "reasons": ["No active consent matches purpose and required data elements or consent expired"]}
