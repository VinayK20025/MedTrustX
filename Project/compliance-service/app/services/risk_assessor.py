"""
Risk Assessor Service.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
import uuid
from app.db.repositories.risk_repo import RiskRepository
from app.models.risk import RiskCreateRequest

tracer = trace.get_tracer(__name__)

class RiskAssessor:
    def __init__(self, session: AsyncSession):
        self.repo = RiskRepository(session)

    async def register_risk(self, tenant_id: str, request: RiskCreateRequest) -> Dict[str, Any]:
        with tracer.start_as_current_span("compliance.risk.register"):
            inherent_risk_score = request.likelihood * request.impact
            residual_risk_score = inherent_risk_score * (1.0 - request.control_effectiveness)
            
            risk_id = str(uuid.uuid4())
            
            risk_dict = request.model_dump()
            risk_dict["id"] = risk_id
            risk_dict["tenant_id"] = tenant_id
            risk_dict["inherent_risk_score"] = inherent_risk_score
            risk_dict["residual_risk_score"] = residual_risk_score
            risk_dict["status"] = "open"
            risk_dict["review_date"] = None
            
            await self.repo.create_risk(risk_dict)
            return risk_dict

    async def get_risk_register(self, tenant_id: str) -> List[Dict[str, Any]]:
        return await self.repo.get_risks(tenant_id)
