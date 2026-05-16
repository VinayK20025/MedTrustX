"""
Consent Repository.
"""
from typing import Dict, Any, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import json

class ConsentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_consent(self, consent_id: UUID) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM patient_consents WHERE id = :id")
        try:
            result = await self.session.execute(stmt, {"id": str(consent_id)})
            row = result.mappings().first()
            return dict(row) if row else None
        except Exception:
            return None

    async def get_active_consents(self, patient_id: str, tenant_id: str) -> List[Dict[str, Any]]:
        stmt = text("""
            SELECT * FROM patient_consents 
            WHERE patient_id = :patient_id AND tenant_id = :tenant_id AND status = 'active'
        """)
        try:
            result = await self.session.execute(stmt, {"patient_id": patient_id, "tenant_id": tenant_id})
            return [dict(row) for row in result.mappings().all()]
        except Exception:
            return []

    async def create_consent(self, consent: Dict[str, Any]) -> None:
        stmt = text("""
            INSERT INTO patient_consents (
                id, tenant_id, patient_id, purpose,
                data_elements, valid_until, status,
                granted_at, revoked_at, cryptographic_proof
            ) VALUES (
                :id, :tenant_id, :patient_id, :purpose,
                :data_elements::jsonb, :valid_until, :status,
                :granted_at, :revoked_at, :cryptographic_proof
            )
        """)
        try:
            await self.session.execute(stmt, {
                "id": consent["id"],
                "tenant_id": consent["tenant_id"],
                "patient_id": consent["patient_id"],
                "purpose": consent["purpose"],
                "data_elements": json.dumps(consent["data_elements"]),
                "valid_until": consent["valid_until"],
                "status": consent["status"],
                "granted_at": consent["granted_at"],
                "revoked_at": consent["revoked_at"],
                "cryptographic_proof": consent["cryptographic_proof"]
            })
            await self.session.commit()
        except Exception:
            pass

    async def update_status(self, consent_id: str, status: str, revoked_at: Optional[Any] = None) -> None:
        stmt = text("""
            UPDATE patient_consents
            SET status = :status, revoked_at = :revoked_at
            WHERE id = :id
        """)
        try:
            await self.session.execute(stmt, {"id": consent_id, "status": status, "revoked_at": revoked_at})
            await self.session.commit()
        except Exception:
            pass
