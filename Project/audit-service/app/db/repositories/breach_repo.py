"""
Breach Incident Repository.
"""
from typing import Dict, Any, List, Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import json

class BreachRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_incident(self, incident: Dict[str, Any]) -> None:
        stmt = text("""
            INSERT INTO breach_incidents (
                id, tenant_id, detected_at, breach_type, severity,
                affected_records_count, affected_user_ids, evidence,
                status, notified_at, notification_sent
            ) VALUES (
                :id, :tenant_id, NOW(), :breach_type, :severity,
                :affected_records_count, :affected_user_ids::jsonb, :evidence::jsonb,
                'detected', NULL, FALSE
            )
        """)
        await self.session.execute(stmt, {
            "id": incident["id"],
            "tenant_id": incident["tenant_id"],
            "breach_type": incident["breach_type"],
            "severity": incident["severity"],
            "affected_records_count": incident["affected_records_count"],
            "affected_user_ids": json.dumps(incident["affected_user_ids"]),
            "evidence": json.dumps(incident["evidence"])
        })
        await self.session.commit()

    async def get_incident(self, incident_id: UUID) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM breach_incidents WHERE id = :id")
        result = await self.session.execute(stmt, {"id": str(incident_id)})
        row = result.mappings().first()
        return dict(row) if row else None

    async def mark_notified(self, incident_id: UUID) -> None:
        stmt = text("""
            UPDATE breach_incidents
            SET notified_at = NOW(), notification_sent = TRUE, status = 'notified'
            WHERE id = :id
        """)
        await self.session.execute(stmt, {"id": str(incident_id)})
        await self.session.commit()
