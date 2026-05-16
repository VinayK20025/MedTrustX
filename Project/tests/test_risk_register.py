"""
Tests for Risk Register.
"""
import pytest
from unittest.mock import AsyncMock, patch

from app.services.risk_assessor import RiskAssessor
from app.models.risk import RiskCreateRequest

@pytest.mark.asyncio
async def test_register_risk():
    mock_session = AsyncMock()
    mock_repo = AsyncMock()
    
    request = RiskCreateRequest(
        title="Test Risk",
        description="Desc",
        framework_refs=["HIPAA"],
        category="Security",
        likelihood=4,
        impact=5,
        control_effectiveness=0.5,
        risk_owner="admin",
        treatment="mitigate",
        mitigation_plan="Plan",
        target_date=None
    )
    
    with patch('app.services.risk_assessor.RiskRepository', return_value=mock_repo):
        assessor = RiskAssessor(mock_session)
        res = await assessor.register_risk("tenant_1", request)
        
        assert res["inherent_risk_score"] == 20
        assert res["residual_risk_score"] == 10.0
        assert res["status"] == "open"
        assert mock_repo.create_risk.called
