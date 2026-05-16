"""
Waitlist Management Service.
"""
from typing import Dict, Any, List
from opentelemetry import trace
import json
import uuid
from datetime import datetime

tracer = trace.get_tracer(__name__)

class WaitlistManager:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def add_to_waitlist(self, tenant_id: str, data: Dict[str, Any]) -> str:
        with tracer.start_as_current_span("waitlist.add"):
            entry_id = str(uuid.uuid4())
            entry = {
                "id": entry_id,
                "tenant_id": tenant_id,
                "added_at": datetime.utcnow().isoformat(),
                **data
            }
            
            await self.redis.hset(
                f"medtrust:waitlist:{tenant_id}",
                entry_id,
                json.dumps(entry)
            )
            
            urgency_score = 1
            if data.get("urgency") == "high": urgency_score = 3
            if data.get("urgency") == "urgent": urgency_score = 5
            
            score = datetime.utcnow().timestamp() - (urgency_score * 86400)
            
            await self.redis.zadd(f"medtrust:waitlist_queue:{tenant_id}", {entry_id: score})
            
            return entry_id

    async def remove_from_waitlist(self, tenant_id: str, entry_id: str) -> None:
        await self.redis.hdel(f"medtrust:waitlist:{tenant_id}", entry_id)
        await self.redis.zrem(f"medtrust:waitlist_queue:{tenant_id}", entry_id)
