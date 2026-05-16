"""
Violation Repository.
Queries the audit_log table in clinical DB for violations.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class ViolationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_violations(
        self,
        tenant_id: Optional[UUID] = None,
        severity: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        action_taken: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        query = "SELECT * FROM audit_log WHERE 1=1"
        params: Dict[str, Any] = {}
        
        if tenant_id:
            query += " AND tenant_id = :tenant_id"
            params["tenant_id"] = str(tenant_id)
        if severity:
            query += " AND severity = :severity"
            params["severity"] = severity
        if action_taken:
            query += " AND action_taken = :action_taken"
            params["action_taken"] = action_taken
        if start_date:
            query += " AND timestamp >= :start_date"
            params["start_date"] = start_date
        if end_date:
            query += " AND timestamp <= :end_date"
            params["end_date"] = end_date
            
        query += " ORDER BY timestamp DESC LIMIT :limit OFFSET :offset"
        params["limit"] = limit
        params["offset"] = offset
        
        result = await self.session.execute(text(query), params)
        return [dict(row._mapping) for row in result]

    async def get_stats(self) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        last_24h = now - timedelta(days=1)
        last_7d = now - timedelta(days=7)
        
        # Last 24h count
        res_24h = await self.session.execute(text(
            "SELECT COUNT(*) FROM audit_log WHERE timestamp >= :start_time"
        ), {"start_time": last_24h})
        count_24h = res_24h.scalar() or 0
        
        # Last 7d count
        res_7d = await self.session.execute(text(
            "SELECT COUNT(*) FROM audit_log WHERE timestamp >= :start_time"
        ), {"start_time": last_7d})
        count_7d = res_7d.scalar() or 0
        
        # Top violating users
        res_users = await self.session.execute(text(
            """SELECT user_id, COUNT(*) as cnt FROM audit_log 
               WHERE action_taken = 'blocked' 
               GROUP BY user_id ORDER BY cnt DESC LIMIT 5"""
        ))
        top_users = [{"user_id": str(r[0]), "count": r[1]} for r in res_users]
        
        # Most targeted tenants
        res_tenants = await self.session.execute(text(
            """SELECT target_tenant_id, COUNT(*) as cnt FROM audit_log 
               WHERE action_taken = 'blocked' 
               GROUP BY target_tenant_id ORDER BY cnt DESC LIMIT 5"""
        ))
        top_tenants = [{"tenant_id": str(r[0]), "count": r[1]} for r in res_tenants]
        
        # Action taken counts
        res_actions = await self.session.execute(text(
            """SELECT action_taken, COUNT(*) as cnt FROM audit_log 
               GROUP BY action_taken"""
        ))
        blocked_count = 0
        privileged_allowed_count = 0
        for r in res_actions:
            if r[0] == 'blocked':
                blocked_count = r[1]
            elif r[0] == 'allowed_privileged':
                privileged_allowed_count = r[1]
                
        return {
            "violations_last_24h": count_24h,
            "violations_last_7d": count_7d,
            "top_violating_users": top_users,
            "most_targeted_tenants": top_tenants,
            "blocked_count": blocked_count,
            "privileged_allowed_count": privileged_allowed_count
        }
