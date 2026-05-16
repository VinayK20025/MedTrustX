"""
Tests for Breach Detection.
"""
import pytest
from unittest.mock import AsyncMock, patch

from app.services.breach_detector import BreachDetector

@pytest.mark.asyncio
async def test_breach_detector_run():
    mock_session = AsyncMock()
    mock_redis = AsyncMock()
    
    mock_row = {"tenant_id": "tenant_1", "user_id": "malicious_user", "cnt": 15}
    
    from unittest.mock import MagicMock
    mock_result = MagicMock()
    mock_result.mappings.return_value.all.return_value = [mock_row]
    mock_session.execute.return_value = mock_result
    
    mock_repo = AsyncMock()
    
    with patch('app.services.breach_detector.BreachRepository', return_value=mock_repo):
        detector = BreachDetector(mock_session, mock_redis)
        await detector.run()
        
        assert mock_repo.create_incident.called
        incident = mock_repo.create_incident.call_args[0][0]
        assert incident["breach_type"] == "mass_deletion"
        assert incident["affected_records_count"] == 15
        assert mock_redis.publish.called
