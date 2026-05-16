"""
Consent Checker Service.
"""
from typing import List, Dict, Any
import httpx
from opentelemetry import trace

from app.config import settings

tracer = trace.get_tracer(__name__)

class ConsentChecker:
    def __init__(self):
        self.base_url = settings.consent_service_url

    async def verify_access(self, tenant_id: str, patient_id: str, purpose: str, required_elements: List[str]) -> bool:
        with tracer.start_as_current_span("consent.check"):
            payload = {
                "patient_id": patient_id,
                "purpose": purpose,
                "required_elements": required_elements
            }
            
            try:
                async with httpx.AsyncClient(timeout=5) as client:
                    resp = await client.post(
                        f"{self.base_url}/api/consent/verify",
                        json=payload,
                        headers={"X-Tenant-ID": tenant_id}
                    )
                    
                if resp.status_code == 200:
                    return resp.json().get("is_valid", False)
                return False
            except Exception:
                return False
