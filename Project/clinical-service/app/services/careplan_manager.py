"""
Care Plan Manager.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.careplan_repo import CarePlanRepository
from typing import Dict, Any

class CarePlanManager:
    def __init__(self, session: AsyncSession):
        self.repo = CarePlanRepository(session)
        
    async def create_plan(self, tenant_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        return await self.repo.create_careplan(tenant_id, data)
