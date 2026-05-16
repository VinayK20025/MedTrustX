"""
Request Log Repository.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class RequestLogRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def log_request(self, log_data: dict) -> None:
        stmt = text("""
            INSERT INTO api_request_logs (
                request_id, tenant_id, source_ip, 
                method, path, status_code, duration_ms, timestamp
            ) VALUES (
                :request_id, :tenant_id, :source_ip, 
                :method, :path, :status_code, :duration_ms, NOW()
            )
        """)
        await self.session.execute(stmt, log_data)
        await self.session.commit()
