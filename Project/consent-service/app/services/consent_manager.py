"""
Consent Manager Service.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
import uuid
from datetime import datetime, timezone

from app.db.repositories.consent_repo import ConsentRepository
from app.services.smart_contract_client import SmartContractClient
from app.models.consent import ConsentGrantRequest

tracer = trace.get_tracer(__name__)

class ConsentManager:
    def __init__(self, session: AsyncSession):
        self.repo = ConsentRepository(session)
        self.sc_client = SmartContractClient(session)

    async def grant_consent(self, tenant_id: str, request: ConsentGrantRequest) -> Dict[str, Any]:
        with tracer.start_as_current_span("consent.grant"):
            consent_id = str(uuid.uuid4())
            
            consent_dict = {
                "id": consent_id,
                "tenant_id": tenant_id,
                "patient_id": request.patient_id,
                "purpose": request.purpose,
                "data_elements": request.data_elements,
                "valid_until": request.valid_until,
                "status": "active",
                "granted_at": datetime.now(timezone.utc),
                "revoked_at": None,
                "cryptographic_proof": None
            }
            
            tx_hash = await self.sc_client.anchor_consent(consent_dict)
            consent_dict["cryptographic_proof"] = tx_hash
            
            await self.repo.create_consent(consent_dict)
            return consent_dict

    async def revoke_consent(self, consent_id: str) -> None:
        with tracer.start_as_current_span("consent.revoke"):
            await self.repo.update_status(consent_id, "revoked", datetime.now(timezone.utc))

    async def get_patient_consents(self, patient_id: str, tenant_id: str) -> List[Dict[str, Any]]:
        return await self.repo.get_active_consents(patient_id, tenant_id)
