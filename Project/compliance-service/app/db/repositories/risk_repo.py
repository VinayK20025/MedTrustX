"""
Risk Repository.
"""
from typing import Dict, Any, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import json

class RiskRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_risks(self, tenant_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        stmt = text("""
            SELECT * FROM compliance_risks
            WHERE tenant_id = :tenant_id
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        """)
        try:
            result = await self.session.execute(stmt, {"tenant_id": tenant_id, "limit": limit, "offset": offset})
            return [dict(row) for row in result.mappings().all()]
        except Exception:
            return []

    async def create_risk(self, risk: Dict[str, Any]) -> None:
        stmt = text("""
            INSERT INTO compliance_risks (
                id, tenant_id, title, description, framework_refs, category,
                likelihood, impact, inherent_risk_score, control_effectiveness,
                residual_risk_score, risk_owner, treatment, mitigation_plan,
                target_date, status, review_date, created_at
            ) VALUES (
                :id, :tenant_id, :title, :description, :framework_refs::jsonb, :category,
                :likelihood, :impact, :inherent_risk_score, :control_effectiveness,
                :residual_risk_score, :risk_owner, :treatment, :mitigation_plan,
                :target_date, :status, :review_date, NOW()
            )
        """)
        try:
            await self.session.execute(stmt, {
                "id": risk["id"],
                "tenant_id": risk["tenant_id"],
                "title": risk["title"],
                "description": risk["description"],
                "framework_refs": json.dumps(risk["framework_refs"]),
                "category": risk["category"],
                "likelihood": risk["likelihood"],
                "impact": risk["impact"],
                "inherent_risk_score": risk["inherent_risk_score"],
                "control_effectiveness": risk["control_effectiveness"],
                "residual_risk_score": risk["residual_risk_score"],
                "risk_owner": risk["risk_owner"],
                "treatment": risk["treatment"],
                "mitigation_plan": risk["mitigation_plan"],
                "target_date": risk["target_date"],
                "status": risk["status"],
                "review_date": risk["review_date"]
            })
            await self.session.commit()
        except Exception:
            pass
