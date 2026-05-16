"""
JIT Manager Service.
"""
from typing import Dict, Any, Optional, List
from uuid import UUID
import uuid
import json

from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from opentelemetry import trace

from app.db.repositories.jit_request_repo import JITRequestRepository
from app.db.repositories.recording_repo import RecordingRepository

tracer = trace.get_tracer(__name__)

class JITManager:
    def __init__(self, session: AsyncSession, redis: Redis):
        self.repo = JITRequestRepository(session)
        self.recording_repo = RecordingRepository(session)
        self.redis = redis

    async def request_access(self, user_id: UUID, tenant_id: UUID, resource_type: str, 
                             resource_id: str, reason: str, duration_minutes: int) -> Dict[str, Any]:
        with tracer.start_as_current_span("pam.jit.request"):
            req_id = uuid.uuid4()
            await self.repo.create_request(
                req_id, user_id, tenant_id, resource_type, resource_id, reason, duration_minutes
            )
            
            await self.redis.publish("medtrust:pam:alerts", json.dumps({
                "event": "jit_requested",
                "request_id": str(req_id),
                "user_id": str(user_id),
                "resource": f"{resource_type}/{resource_id}",
                "reason": reason
            }))
            
            return {
                "id": req_id,
                "user_id": user_id,
                "tenant_id": tenant_id,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "status": "pending",
                "created_at": "now"
            }

    async def approve_request(self, request_id: UUID, approver_id: UUID, status: str) -> bool:
        with tracer.start_as_current_span("pam.jit.approve"):
            if status not in ["approved", "denied"]:
                raise ValueError("Invalid status")
                
            req = await self.repo.get_request(request_id)
            if not req:
                raise ValueError("Request not found")
                
            if req["status"] != "pending":
                raise ValueError("Request already processed")
                
            await self.repo.update_status(request_id, status, approver_id)
            
            if status == "approved":
                duration = req["duration_minutes"] * 60
                await self.redis.setex(
                    f"medtrust:pam:jit:{req['user_id']}:{req['resource_type']}:{req['resource_id']}",
                    duration,
                    "granted"
                )
                
            await self.redis.publish("medtrust:pam:alerts", json.dumps({
                "event": f"jit_{status}",
                "request_id": str(request_id),
                "approver_id": str(approver_id)
            }))
            return True

    async def check_access(self, user_id: str, resource_type: str, resource_id: str) -> bool:
        key = f"medtrust:pam:jit:{user_id}:{resource_type}:{resource_id}"
        val = await self.redis.get(key)
        return val == "granted"
