"""
Audit Event Repository.
"""
from typing import Dict, Any, List, Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import json

class AuditEventRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_last_event(self) -> Optional[Dict[str, Any]]:
        stmt = text("""
            SELECT * FROM audit_log
            ORDER BY chain_sequence DESC
            LIMIT 1
            FOR UPDATE
        """)
        result = await self.session.execute(stmt)
        row = result.mappings().first()
        return dict(row) if row else None

    async def append_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        stmt = text("""
            INSERT INTO audit_log (
                id, tenant_id, user_id, action, resource_type, resource_id,
                details, ip_address, created_at, previous_hash, current_hash, chain_sequence
            ) VALUES (
                :id, :tenant_id, :user_id, :action, :resource_type, :resource_id,
                :details::jsonb, :ip_address, NOW(), :previous_hash, :current_hash, :chain_sequence
            ) RETURNING *
        """)
        
        result = await self.session.execute(stmt, {
            "id": event["id"],
            "tenant_id": event["tenant_id"],
            "user_id": event["user_id"],
            "action": event["action"],
            "resource_type": event["resource_type"],
            "resource_id": event["resource_id"],
            "details": json.dumps(event["details"]),
            "ip_address": event["ip_address"],
            "previous_hash": event["previous_hash"],
            "current_hash": event["current_hash"],
            "chain_sequence": event["chain_sequence"]
        })
        row = result.mappings().first()
        await self.session.commit()
        return dict(row) if row else {}

    async def get_events_range(self, start_seq: int, end_seq: int) -> List[Dict[str, Any]]:
        stmt = text("""
            SELECT * FROM audit_log
            WHERE chain_sequence >= :start_seq AND chain_sequence <= :end_seq
            ORDER BY chain_sequence ASC
        """)
        result = await self.session.execute(stmt, {
            "start_seq": start_seq,
            "end_seq": end_seq
        })
        return [dict(row) for row in result.mappings().all()]
