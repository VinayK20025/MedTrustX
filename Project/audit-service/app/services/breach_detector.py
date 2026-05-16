"""
Breach Detector Background Task.
"""
from typing import Dict, Any, List
from datetime import datetime, timezone
import uuid
import json
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
from redis.asyncio import Redis

from app.db.repositories.breach_repo import BreachRepository

tracer = trace.get_tracer(__name__)

class BreachDetector:
    def __init__(self, session: AsyncSession, redis: Redis):
        self.session = session
        self.repo = BreachRepository(session)
        self.redis = redis

    async def run(self):
        """Run breach detection heuristics on recent audit logs."""
        with tracer.start_as_current_span("audit.breach.detect"):
            stmt = text("""
                SELECT tenant_id, user_id, COUNT(*) as cnt
                FROM audit_log
                WHERE action = 'DELETE'
                  AND created_at >= NOW() - INTERVAL '1 hour'
                GROUP BY tenant_id, user_id
                HAVING COUNT(*) > 10
            """)
            
            result = await self.session.execute(stmt)
            rows = result.mappings().all()
            
            for row in rows:
                incident = {
                    "id": str(uuid.uuid4()),
                    "tenant_id": row["tenant_id"],
                    "breach_type": "mass_deletion",
                    "severity": "CRITICAL",
                    "affected_records_count": row["cnt"],
                    "affected_user_ids": [row["user_id"]],
                    "evidence": {"description": f"{row['cnt']} DELETE actions in 1 hour by user {row['user_id']}"}
                }
                
                await self.repo.create_incident(incident)
                
                await self.redis.publish("medtrust:breach:incidents", json.dumps({
                    "event": "breach_detected",
                    "data": incident,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }))
