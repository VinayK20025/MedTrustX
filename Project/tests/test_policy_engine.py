"""
Tests for Consent Policy Engine.
"""
import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime, timedelta, timezone

from app.services.policy_engine import ConsentPolicyEngine

@pytest.mark.asyncio
async def test_verify_access_valid():
    mock_session = AsyncMock()
    mock_manager = AsyncMock()
    
    mock_manager.get_patient_consents.return_value = [{
        "id": "c1",
        "purpose": "treatment",
        "valid_until": datetime.now(timezone.utc) + timedelta(days=1),
        "data_elements": ["phi"]
    }]
    
    with patch('app.services.policy_engine.ConsentManager', return_value=mock_manager):
        engine = ConsentPolicyEngine(mock_session)
        res = await engine.verify_access("t1", "p1", "treatment", ["phi"])
        
        assert res["is_valid"] is True
        assert res["consent_ids"] == ["c1"]

@pytest.mark.asyncio
async def test_verify_access_invalid_purpose():
    mock_session = AsyncMock()
    mock_manager = AsyncMock()
    
    mock_manager.get_patient_consents.return_value = [{
        "id": "c1",
        "purpose": "billing",
        "valid_until": datetime.now(timezone.utc) + timedelta(days=1),
        "data_elements": ["phi"]
    }]
    
    with patch('app.services.policy_engine.ConsentManager', return_value=mock_manager):
        engine = ConsentPolicyEngine(mock_session)
        res = await engine.verify_access("t1", "p1", "treatment", ["phi"])
        
        assert res["is_valid"] is False
