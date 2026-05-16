"""
Report Generator Service.
"""
import uuid
import json
import asyncio
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
from redis.asyncio import Redis

from app.db.repositories.report_repo import ReportRepository

tracer = trace.get_tracer(__name__)

class ReportGenerator:
    def __init__(self, session: AsyncSession, redis: Redis):
        self.repo = ReportRepository(session)
        self.redis = redis

    async def request_report(self, tenant_id: str, report_type: str, framework: Optional[str], format: str) -> str:
        with tracer.start_as_current_span("compliance.report.request"):
            job_id = uuid.uuid4()
            await self.repo.create_report_job(job_id, tenant_id, report_type, framework, format)
            
            payload = {
                "job_id": str(job_id),
                "tenant_id": tenant_id,
                "report_type": report_type,
                "framework": framework,
                "format": format
            }
            await self.redis.publish("medtrust:compliance:report_jobs", json.dumps(payload))
            
            asyncio.create_task(self._simulate_worker(str(job_id)))
            
            return str(job_id)

    async def _simulate_worker(self, job_id: str):
        await asyncio.sleep(2)

    async def get_report_status(self, job_id: str) -> Dict[str, Any]:
        return await self.repo.get_report(uuid.UUID(job_id))
