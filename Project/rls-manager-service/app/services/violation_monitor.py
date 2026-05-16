"""
Violation Monitor Service.
"""
from typing import Any, Dict
from app.db.sessions import get_raw_session
from app.db.repositories.violation_repo import ViolationRepository

class ViolationMonitor:
    async def get_stats(self) -> Dict[str, Any]:
        session = await get_raw_session("clinical")
        try:
            repo = ViolationRepository(session)
            return await repo.get_stats()
        finally:
            await session.close()
