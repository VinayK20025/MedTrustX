"""
Auth Log Repository.
"""
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime, timedelta, timezone
import json

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class AuthLogRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def insert_log(self, user_id: str, device_id: str, tenant_id: str, 
                         endpoint: str, query_attempted: str, source_ip: str, 
                         action_taken: str, severity: str, details: str = "{}") -> None:
        stmt = text("""
            INSERT INTO auth_logs (
                id, timestamp, user_id, device_id, tenant_id, target_tenant_id, 
                endpoint, query_attempted, source_ip, action_taken, severity, details
            ) VALUES (
                gen_random_uuid(), NOW(), :user, :device, :tenant, :tenant,
                :endpoint, :query, :ip, :action, :severity, :details::jsonb
            )
        """)
        await self.session.execute(stmt, {
            "user": user_id,
            "device": device_id,
            "tenant": tenant_id,
            "endpoint": endpoint,
            "query": query_attempted,
            "ip": source_ip,
            "action": action_taken,
            "severity": severity,
            "details": details
        })
        await self.session.commit()

    async def get_failed_attempts_24h(self, user_id: str) -> int:
        last_24h = datetime.now(timezone.utc) - timedelta(hours=24)
        stmt = text("""
            SELECT COUNT(*) FROM auth_logs 
            WHERE user_id = :uid 
            AND action_taken IN ('deny', 'blocked')
            AND timestamp >= :time
        """)
        result = await self.session.execute(stmt, {"uid": user_id, "time": last_24h})
        return result.scalar() or 0

    async def compute_anomaly_score(self, user_id: str) -> float:
        last_7d = datetime.now(timezone.utc) - timedelta(days=7)
        stmt_total = text("""
            SELECT COUNT(*) FROM auth_logs 
            WHERE user_id = :uid AND timestamp >= :time AND action_taken = 'allow'
        """)
        res_total = await self.session.execute(stmt_total, {"uid": user_id, "time": last_7d})
        total = res_total.scalar() or 0
        
        if total == 0:
            return 0.0
            
        stmt_after_hours = text("""
            SELECT COUNT(*) FROM auth_logs 
            WHERE user_id = :uid AND timestamp >= :time AND action_taken = 'allow'
            AND (EXTRACT(HOUR FROM timestamp) < 6 OR EXTRACT(HOUR FROM timestamp) >= 22)
        """)
        res_after = await self.session.execute(stmt_after_hours, {"uid": user_id, "time": last_7d})
        after_hours = res_after.scalar() or 0
        
        return after_hours / total
