"""
Tests for Consent Lifecycle.
"""
import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime, timedelta, timezone

from app.services.consent_manager import ConsentManager
from app.models.consent import ConsentGrantRequest

@pytest.mark.asyncio
async def test_grant_consent():
    mock_session = AsyncMock()
    mock_repo = AsyncMock()
    mock_sc_client = AsyncMock()
    
    mock_sc_client.anchor_consent.return_value = "0xABC123"
    
    request = ConsentGrantRequest(
        patient_id="pat_1",
        purpose="treatment",
        data_elements=["phi", "demographics"],
        valid_until=datetime.now(timezone.utc) + timedelta(days=365),
        signature="sig"
    )
    
    with patch('app.services.consent_manager.ConsentRepository', return_value=mock_repo), \
         patch('app.services.consent_manager.SmartContractClient', return_value=mock_sc_client):
         
        manager = ConsentManager(mock_session)
        res = await manager.grant_consent("tenant_1", request)
        
        assert res["status"] == "active"
        assert res["cryptographic_proof"] == "0xABC123"
        assert mock_repo.create_consent.called
