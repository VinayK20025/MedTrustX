"""
Request Log Repository.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timedelta

class RequestLogRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_recent_logs(self, minutes: int = 60) -> List[Dict[str, Any]]:
        since = datetime.utcnow() - timedelta(minutes=minutes)
        stmt = text("""
            SELECT * FROM api_request_logs 
            WHERE timestamp >= :since
        """)
        result = await self.session.execute(stmt, {"since": since})
        return [dict(row) for row in result.mappings().all()]
        
    async def get_rate_limited_requests(self, minutes: int = 60) -> List[Dict[str, Any]]:
        since = datetime.utcnow() - timedelta(minutes=minutes)
        stmt = text("""
            SELECT * FROM api_request_logs 
            WHERE timestamp >= :since AND status_code = 429
        """)
        result = await self.session.execute(stmt, {"since": since})
        return [dict(row) for row in result.mappings().all()]

    async def get_failed_auth_requests(self, minutes: int = 1) -> List[Dict[str, Any]]:
        since = datetime.utcnow() - timedelta(minutes=minutes)
        stmt = text("""
            SELECT * FROM api_request_logs 
            WHERE timestamp >= :since AND status_code = 401
        """)
        result = await self.session.execute(stmt, {"since": since})
        return [dict(row) for row in result.mappings().all()]
