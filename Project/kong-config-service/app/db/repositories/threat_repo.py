"""
Threat Log Repository.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime

class ThreatRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def log_threat(self, threat_type: str, source_ip: str, details: str = None) -> Dict[str, Any]:
        stmt = text("""
            INSERT INTO threat_logs (threat_type, source_ip, details, timestamp)
            VALUES (:threat_type, :source_ip, :details, :timestamp)
            RETURNING *
        """)
        params = {
            "threat_type": threat_type,
            "source_ip": source_ip,
            "details": details,
            "timestamp": datetime.utcnow()
        }
        result = await self.session.execute(stmt, params)
        row = result.mappings().first()
        await self.session.commit()
        return dict(row)

    async def get_recent_threats(self, hours: int = 24) -> List[Dict[str, Any]]:
        stmt = text("""
            SELECT * FROM threat_logs
            WHERE timestamp >= NOW() - INTERVAL ':hours hours'
        """)
        result = await self.session.execute(stmt, {"hours": hours})
        return [dict(row) for row in result.mappings().all()]
