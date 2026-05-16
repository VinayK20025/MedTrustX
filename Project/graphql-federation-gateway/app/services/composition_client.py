"""
Composition Gateway Client.
"""
import httpx
from app.config import settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

class CompositionClient:
    def __init__(self, token: str):
        self.base_url = settings.composition_gateway_url
        self.headers = {"Authorization": f"Bearer {token}"} if token else {}

    async def get_patient_dashboard(self, patient_id: str) -> dict:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                f"{self.base_url}/api/composed/patient-dashboard/{patient_id}",
                headers=self.headers
            )
            res.raise_for_status()
            return res.json()

    async def get_clinical_summary(self, patient_id: str) -> dict:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                f"{self.base_url}/api/composed/clinical-summary/{patient_id}",
                headers=self.headers
            )
            res.raise_for_status()
            return res.json()

    async def get_admin_overview(self, tenant_id: str) -> dict:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                f"{self.base_url}/api/composed/admin-overview/{tenant_id}",
                headers=self.headers
            )
            res.raise_for_status()
            return res.json()
