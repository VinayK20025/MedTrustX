"""
Tests for Hash Chain Integrity.
"""
import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime, timezone

from app.services.integrity_verifier import IntegrityVerifier

@pytest.mark.asyncio
async def test_verify_chain_intact():
    mock_session = AsyncMock()
    mock_repo = AsyncMock()
    
    ev1 = {"id": "1", "action": "CREATE", "current_hash": "hash1", "previous_hash": "hash0", "chain_sequence": 1}
    ev2 = {"id": "2", "action": "UPDATE", "current_hash": "hash2", "previous_hash": "hash1", "chain_sequence": 2}
    
    def mock_compute_hash(ev):
        return ev["current_hash"]
        
    mock_repo.get_events_range.return_value = [ev1, ev2]
    
    with patch('app.services.integrity_verifier.AuditEventRepository', return_value=mock_repo), \
         patch('app.services.integrity_verifier.compute_hash', side_effect=mock_compute_hash):
         
        verifier = IntegrityVerifier(mock_session)
        report = await verifier.verify_chain("tenant_1", 1, 2)
        
        assert report["chain_intact"] is True
        assert report["verified_count"] == 2
        assert report["tampered_count"] == 0

@pytest.mark.asyncio
async def test_verify_chain_tampered():
    mock_session = AsyncMock()
    mock_repo = AsyncMock()
    
    ev1 = {"id": "1", "action": "CREATE", "current_hash": "hash1", "previous_hash": "hash0", "chain_sequence": 1}
    ev2 = {"id": "2", "action": "UPDATE", "current_hash": "tampered_hash", "previous_hash": "hash1", "chain_sequence": 2}
    
    def mock_compute_hash(ev):
        if ev["id"] == "2":
            return "expected_hash_2"
        return ev["current_hash"]
        
    mock_repo.get_events_range.return_value = [ev1, ev2]
    
    with patch('app.services.integrity_verifier.AuditEventRepository', return_value=mock_repo), \
         patch('app.services.integrity_verifier.compute_hash', side_effect=mock_compute_hash):
         
        verifier = IntegrityVerifier(mock_session)
        report = await verifier.verify_chain("tenant_1", 1, 2)
        
        assert report["chain_intact"] is False
        assert report["tampered_count"] == 1
        assert report["first_tampered_sequence"] == 2
