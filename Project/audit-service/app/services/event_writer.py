"""
Event Writer Service.
"""
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
from redis.asyncio import Redis
import json

from app.db.repositories.audit_repo import AuditEventRepository
from app.services.hash_chainer import compute_hash

tracer = trace.get_tracer(__name__)

class AuditEventWriter:
    def __init__(self, session: AsyncSession, redis: Redis):
        self.repo = AuditEventRepository(session)
        self.redis = redis

    async def write(self, event: Dict[str, Any]) -> Dict[str, Any]:
        with tracer.start_as_current_span("audit.event.write"):
            last_event = await self.repo.get_last_event()
            
            if last_event:
                previous_hash = last_event["current_hash"]
                chain_sequence = last_event["chain_sequence"] + 1
            else:
                from hashlib import sha256
                previous_hash = sha256(b"MEDTRUSTX_GENESIS_2026").hexdigest()
                chain_sequence = 1
                
            event["previous_hash"] = previous_hash
            event["chain_sequence"] = chain_sequence
            
            event["current_hash"] = compute_hash(event)
            
            record = await self.repo.append_event(event)
            
            redis_msg = dict(record)
            for k, v in redis_msg.items():
                if hasattr(v, "isoformat"):
                    redis_msg[k] = v.isoformat()
                elif hasattr(v, "hex"):
                    redis_msg[k] = str(v)
            
            await self.redis.publish("medtrust:audit:events", json.dumps({
                "event": "audit_event",
                "data": redis_msg,
                "timestamp": record["created_at"].isoformat()
            }))
            
            return record
