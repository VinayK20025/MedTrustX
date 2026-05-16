"""
Tests for Compliance Engine.
"""
import pytest
from unittest.mock import AsyncMock, patch

from app.services.gap_analyzer import GapAnalyzer

@pytest.mark.asyncio
async def test_gap_analysis():
    mock_session = AsyncMock()
    
    mock_mapper = AsyncMock()
    
    from app.models.control import FrameworkControl

    ctrl1 = FrameworkControl(
        control_id="C1", framework="F", category="C", title="T1", description="D",
        requirement="R", implementation="Imp1", evidence_source="E", automated=True, severity="high"
    )
    ctrl2 = FrameworkControl(
        control_id="C2", framework="F", category="C", title="T2", description="D",
        requirement="R", implementation="Imp2", evidence_source="E", automated=True, severity="high"
    )
    
    mock_mapper.get_framework_controls.return_value = [ctrl1, ctrl2]
    
    async def mock_eval(tenant, ctrl):
        if ctrl.control_id == "C1":
            return True
        return False
        
    mock_mapper.evaluate_control = mock_eval
    
    with patch('app.services.gap_analyzer.ControlMapper', return_value=mock_mapper):
        analyzer = GapAnalyzer(mock_session)
        report = await analyzer.analyze_framework("tenant_1", "HIPAA")
        
        assert report.total_controls == 2
        assert report.implemented == 1
        assert report.not_implemented == 1
        assert report.compliance_percentage == 50.0
        assert len(report.critical_gaps) == 1
        assert report.critical_gaps[0].control_id == "C2"
