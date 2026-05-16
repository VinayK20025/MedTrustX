import pytest
from unittest.mock import AsyncMock
from app.services.vitals_processor import VitalsProcessor

@pytest.mark.asyncio
async def test_vitals_zscore_computation():
    mock_session = AsyncMock()
    mock_redis = AsyncMock()
    
    processor = VitalsProcessor(mock_session, mock_redis)
    
    processor.repo.get_recent_vitals = AsyncMock(return_value=[
        {"value": 70}, {"value": 72}, {"value": 71}, {"value": 73}, {"value": 69}
    ])
    
    z1 = await processor._compute_zscore("tenant", "pat", "heart_rate", 71)
    assert abs(z1) < 0.1
    
    z2 = await processor._compute_zscore("tenant", "pat", "heart_rate", 120)
    assert z2 > 3.0
