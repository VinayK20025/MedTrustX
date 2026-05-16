"""
Smart Contract State Repository.
"""
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class SmartContractRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_patient_contract(self, patient_id: str, tenant_id: str) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM patient_smart_contracts WHERE patient_id = :patient_id AND tenant_id = :tenant_id")
        try:
            result = await self.session.execute(stmt, {"patient_id": patient_id, "tenant_id": tenant_id})
            row = result.mappings().first()
            return dict(row) if row else None
        except Exception:
            return None

    async def register_contract(self, patient_id: str, tenant_id: str, contract_address: str, public_key: str) -> None:
        stmt = text("""
            INSERT INTO patient_smart_contracts (patient_id, tenant_id, contract_address, public_key, registered_at)
            VALUES (:patient_id, :tenant_id, :contract_address, :public_key, NOW())
        """)
        try:
            await self.session.execute(stmt, {
                "patient_id": patient_id,
                "tenant_id": tenant_id,
                "contract_address": contract_address,
                "public_key": public_key
            })
            await self.session.commit()
        except Exception:
            pass
