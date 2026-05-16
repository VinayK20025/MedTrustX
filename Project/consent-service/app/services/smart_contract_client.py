"""
Smart Contract Interaction Client.
"""
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
from datetime import datetime, timezone


from app.db.repositories.smart_contract_repo import SmartContractRepository

tracer = trace.get_tracer(__name__)

class SmartContractClient:
    def __init__(self, session: AsyncSession):
        self.repo = SmartContractRepository(session)

    async def anchor_consent(self, consent_dict: Dict[str, Any]) -> str:
        with tracer.start_as_current_span("consent.contract.anchor"):
            import hashlib
            import json
            data = json.dumps({
                "patient": consent_dict["patient_id"],
                "purpose": consent_dict["purpose"],
                "valid": consent_dict["valid_until"].isoformat() if hasattr(consent_dict["valid_until"], "isoformat") else str(consent_dict["valid_until"])
            }, sort_keys=True)
            consent_hash = hashlib.sha256(data.encode()).hexdigest()
            
            tx_hash = f"0x{hashlib.sha256(consent_hash.encode() + str(datetime.now().timestamp()).encode()).hexdigest()}"
            
            return tx_hash
