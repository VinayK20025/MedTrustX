"""
Tests for Smart Contract Anchoring.
"""
import pytest
from unittest.mock import AsyncMock
from datetime import datetime, timezone

from app.services.smart_contract_client import SmartContractClient

@pytest.mark.asyncio
async def test_anchor_consent():
    mock_session = AsyncMock()
    client = SmartContractClient(mock_session)
    
    consent_dict = {
        "patient_id": "pat_1",
        "purpose": "treatment",
        "valid_until": datetime.now(timezone.utc)
    }
    
    tx_hash = await client.anchor_consent(consent_dict)
    assert tx_hash.startswith("0x")
    assert len(tx_hash) > 10
