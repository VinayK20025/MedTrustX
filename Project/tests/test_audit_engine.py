"""
Tests for Audit Engine.
"""
import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime, timezone

from app.services.event_writer import AuditEventWriter

@pytest.mark.asyncio
async def test_audit_event_hash_chain_logic():
    mock_session = AsyncMock()
    mock_redis = AsyncMock()
    
    mock_repo = AsyncMock()
    mock_repo.get_last_event.return_value = {
        "current_hash": "genesis_hash_123",
        "chain_sequence": 1
    }
    mock_repo.append_event.return_value = {
        "id": "event_id_1",
        "tenant_id": "tenant_1",
        "user_id": "user_1",
        "action": "READ",
        "resource_type": "Patient",
        "resource_id": "pat_1",
        "details": {},
        "ip_address": "127.0.0.1",
        "created_at": datetime.now(timezone.utc),
        "previous_hash": "genesis_hash_123",
        "current_hash": "computed_hash",
        "chain_sequence": 2
    }
    
    with patch('app.services.event_writer.AuditEventRepository', return_value=mock_repo):
        writer = AuditEventWriter(mock_session, mock_redis)
        
        event = {
            "id": "event_id_1",
            "tenant_id": "tenant_1",
            "user_id": "user_1",
            "action": "READ",
            "resource_type": "Patient",
            "resource_id": "pat_1",
            "details": {},
            "ip_address": "127.0.0.1"
        }
        
        result = await writer.write(event)
        
        assert result["previous_hash"] == "genesis_hash_123"
        assert result["chain_sequence"] == 2
        assert mock_redis.publish.called
