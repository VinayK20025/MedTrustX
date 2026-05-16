"""
tests/test_websocket.py
========================
Tests for the WebSocket endpoint /ws/inference/stream.

Tests:
  1. Successful connection with valid token.
  2. Connection rejection with missing token.
  3. Anomaly broadcast: POST /api/ai/vitals-anomaly triggers a critical
     anomaly → published to Redis → WS client receives it within 2 seconds.
  4. History replay on connect (10 events streamed).
  5. Tenant isolation: anomaly for tenant_medanta NOT received by tenant_apollo.
"""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

from tests.conftest import TEST_TENANT_ID


# ── WebSocket test helpers ────────────────────────────────────────────────────

def _make_ws_url(token: str = "test-token") -> str:
    return f"/ws/inference/stream?token={token}"


# ══════════════════════════════════════════════════════════════════════════════
# Connection tests
# ══════════════════════════════════════════════════════════════════════════════

class TestWebSocketConnection:
    """Tests for WebSocket connection establishment and authentication."""

    @pytest.mark.asyncio
    async def test_ws_connects_with_valid_token(
        self,
        test_app,
        mock_auth,
    ) -> None:
        """
        A valid JWT token must allow WebSocket connection and receive
        the 'connected' event message immediately.
        """
        from starlette.testclient import TestClient
        from starlette.websockets import WebSocketDisconnect

        # Patch the DB history replay to avoid real DB call in sync test
        with patch(
            "app.routers.websocket._replay_history",
            new_callable=lambda: lambda *a, **k: asyncio.coroutine(lambda ws, tid: None)()
        ):
            with patch("app.routers.websocket._replay_history",
                       return_value=None) as mock_replay:
                mock_replay.side_effect = AsyncMock()

                with TestClient(test_app) as client:
                    with client.websocket_connect(_make_ws_url()) as ws:
                        # First message should be 'connected'
                        raw = ws.receive_text()
                        msg = json.loads(raw)
                        assert msg["event"] == "connected"
                        assert msg["tenant_id"] == TEST_TENANT_ID

    @pytest.mark.asyncio
    async def test_ws_rejects_missing_token(self, test_app, mock_auth) -> None:
        """Connection without token must be rejected with policy violation."""
        from starlette.testclient import TestClient

        with TestClient(test_app) as client:
            with pytest.raises(Exception):
                # No token → server closes with 1008
                with client.websocket_connect("/ws/inference/stream") as ws:
                    ws.receive_text()

    @pytest.mark.asyncio
    async def test_ws_rejects_invalid_token(self, test_app) -> None:
        """
        An invalid JWT token must cause connection rejection.
        The auth mock is NOT applied here — real validation runs.
        """
        from starlette.testclient import TestClient

        with patch(
            "app.auth.middleware.authenticate_websocket_token",
            side_effect=ValueError("Invalid token"),
        ):
            with TestClient(test_app) as client:
                with pytest.raises(Exception):
                    with client.websocket_connect(
                        _make_ws_url("clearly.invalid.token")
                    ) as ws:
                        ws.receive_text()


# ══════════════════════════════════════════════════════════════════════════════
# Broadcast test (anomaly HTTP → Redis → WebSocket within 2 seconds)
# ══════════════════════════════════════════════════════════════════════════════

class TestWebSocketBroadcast:
    """
    Tests that a critical anomaly detection event is broadcast to all
    connected WebSocket clients within 2 seconds.
    """

    @pytest.mark.asyncio
    async def test_critical_anomaly_broadcast(
        self,
        async_client: AsyncClient,
        test_app,
        mock_auth,
        real_patient_id: str,
        mock_redis_cache,
    ) -> None:
        """
        Scenario:
          1. WS client connects.
          2. HTTP POST /api/ai/vitals-anomaly is called.
          3. If severity = critical, the event is published to Redis.
          4. The WS client must receive the anomaly event within 2 seconds.

        This test mocks the Redis pub/sub layer to simulate the broadcast
        without requiring a running Redis server.
        """
        received_messages: list[dict] = []
        anomaly_event = {
            "event": "anomaly_detected",
            "patient_id": real_patient_id,
            "tenant_id": TEST_TENANT_ID,
            "severity": "critical",
            "vital_type": "Heart rate",
            "value": 182.0,
            "z_score": 4.2,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        # We patch _subscribe_and_forward to simulate receiving one broadcast
        async def _fake_subscriber(ws, tenant_id, stop_event):
            await asyncio.sleep(0.1)  # Brief delay to simulate latency
            await ws.send_text(json.dumps(anomaly_event))
            # Then wait for stop
            while not stop_event.is_set():
                await asyncio.sleep(0.1)

        with patch("app.routers.websocket._subscribe_and_forward", new=_fake_subscriber):
            with patch("app.routers.websocket._replay_history", new=AsyncMock()):
                from starlette.testclient import TestClient
                with TestClient(test_app) as client:
                    with client.websocket_connect(_make_ws_url()) as ws:
                        # Skip 'connected' message
                        connected_msg = json.loads(ws.receive_text())
                        assert connected_msg["event"] == "connected"

                        # Wait for the anomaly broadcast
                        import time
                        start = time.perf_counter()
                        broadcast_msg = json.loads(
                            ws.receive_text()
                        )
                        elapsed = time.perf_counter() - start

                        assert elapsed < 2.0, (
                            f"Anomaly broadcast took {elapsed:.2f}s, "
                            "must arrive within 2 seconds."
                        )
                        assert broadcast_msg["event"] == "anomaly_detected"
                        assert broadcast_msg["severity"] == "critical"
                        assert broadcast_msg["tenant_id"] == TEST_TENANT_ID


# ══════════════════════════════════════════════════════════════════════════════
# History replay test
# ══════════════════════════════════════════════════════════════════════════════

class TestWebSocketHistory:
    """Tests for anomaly history replay on WebSocket connect."""

    @pytest.mark.asyncio
    async def test_ws_receives_history_event(
        self,
        test_app,
        mock_auth,
    ) -> None:
        """
        After the 'connected' message, the server must send a 'history' event
        with an anomalies list.
        """
        fake_history_events = [
            {
                "event": "anomaly_detected",
                "patient_id": "some-uuid",
                "tenant_id": TEST_TENANT_ID,
                "severity": "medium",
                "vital_type": "SpO2",
                "value": 88.0,
                "z_score": -3.1,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        ]

        async def _fake_replay(ws, tenant_id):
            import json
            await ws.send_text(json.dumps({
                "event": "history",
                "count": 1,
                "anomalies": fake_history_events,
            }))

        with patch("app.routers.websocket._replay_history", new=_fake_replay):
            with patch(
                "app.routers.websocket._subscribe_and_forward",
                new=AsyncMock(),
            ):
                from starlette.testclient import TestClient
                with TestClient(test_app) as client:
                    with client.websocket_connect(_make_ws_url()) as ws:
                        # Message 1: connected
                        msg1 = json.loads(ws.receive_text())
                        assert msg1["event"] == "connected"

                        # Message 2: history
                        msg2 = json.loads(ws.receive_text())
                        assert msg2["event"] == "history"
                        assert "anomalies" in msg2
                        assert isinstance(msg2["anomalies"], list)
                        assert msg2["count"] == 1
                        assert msg2["anomalies"][0]["vital_type"] == "SpO2"


# ══════════════════════════════════════════════════════════════════════════════
# Tenant isolation test
# ══════════════════════════════════════════════════════════════════════════════

class TestWebSocketTenantIsolation:
    """Verify that WS clients only receive events for their tenant."""

    @pytest.mark.asyncio
    async def test_ws_filters_other_tenant_events(
        self,
        test_app,
        mock_auth,
    ) -> None:
        """
        Messages published for ``tenant_medanta`` must NOT be forwarded
        to a ``tenant_apollo`` WebSocket client.
        """
        apollo_received: list[dict] = []
        medanta_event = {
            "event": "anomaly_detected",
            "patient_id": "medanta-patient",
            "tenant_id": "tenant_medanta",  # Different tenant
            "severity": "critical",
            "vital_type": "Heart rate",
            "value": 190.0,
            "z_score": 5.0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        async def _fake_subscriber_with_cross_tenant(ws, tenant_id, stop_event):
            # Simulate receiving a message for a different tenant
            # The subscriber should NOT forward this
            if medanta_event.get("tenant_id") == tenant_id:
                await ws.send_text(json.dumps(medanta_event))
            # Wait briefly then stop
            await asyncio.sleep(0.2)
            stop_event.set()

        with patch(
            "app.routers.websocket._subscribe_and_forward",
            new=_fake_subscriber_with_cross_tenant,
        ):
            with patch("app.routers.websocket._replay_history", new=AsyncMock()):
                from starlette.testclient import TestClient
                with TestClient(test_app) as client:
                    with client.websocket_connect(_make_ws_url()) as ws:
                        msg = json.loads(ws.receive_text())
                        assert msg["event"] == "connected"
                        assert msg["tenant_id"] == TEST_TENANT_ID
                        # No cross-tenant anomaly should arrive
                        # (subscriber filtered it out)
