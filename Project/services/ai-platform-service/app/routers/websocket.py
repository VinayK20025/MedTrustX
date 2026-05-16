"""
app/routers/websocket.py
=========================
WebSocket endpoint for real-time AI inference event streaming.

Endpoint: WS /ws/inference/stream?token=<jwt>

Protocol (AsyncAPI 2.6 compliant):
  1. Client connects with ?token=<jwt> query parameter.
  2. Server validates PQC+JWT token.
  3. Server replays the last 10 anomaly events from patient_vitals.
  4. Server subscribes to Redis pub/sub channel ``medtrust:ai:anomalies``.
  5. Server forwards every published message to the WebSocket client.
  6. Client disconnect triggers graceful cleanup of the Redis subscription.

Message format (published and forwarded):
  {
    "event": "anomaly_detected",
    "patient_id": "...",
    "tenant_id": "...",
    "severity": "critical",
    "vital_type": "Heart rate",
    "value": 142.0,
    "z_score": 3.8,
    "timestamp": "2026-05-15T10:30:00Z"
  }

Connection lifecycle events:
  { "event": "connected", "message": "WebSocket connection established" }
  { "event": "history",   "anomalies": [...] }
  { "event": "ping",      "timestamp": "..." }
"""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone

import redis.asyncio as aioredis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from app.auth.middleware import authenticate_websocket_token
from app.config import settings
from app.db.session import get_db_session
from app.db.repositories.vitals import VitalsRepository
from app.observability.logging import LogContext, get_logger
from app.observability.metrics import ACTIVE_WEBSOCKET_CONNECTIONS

logger = get_logger(__name__)
router = APIRouter(tags=["WebSocket"])


async def _send_json(ws: WebSocket, data: dict) -> None:
    """Send a JSON message, ignoring errors on a closed connection."""
    try:
        await ws.send_text(json.dumps(data, default=str))
    except Exception:  # noqa: BLE001
        pass


async def _replay_history(ws: WebSocket, tenant_id: str) -> None:
    """
    Fetch and stream the last N anomaly events to the newly connected client.

    Uses the VitalsRepository to retrieve recent high-percentile readings.
    """
    try:
        async with get_db_session(tenant_id) as session:
            repo = VitalsRepository(session)
            events = await repo.get_recent_anomaly_events(
                limit=settings.ws_history_events
            )

        history_payload = []
        for ev in events:
            history_payload.append({
                "event": "anomaly_detected",
                "patient_id": str(ev.get("patient_id", "")),
                "tenant_id": tenant_id,
                "severity": "medium",
                "vital_type": ev.get("vital_type", ""),
                "value": ev.get("value", 0.0),
                "z_score": None,
                "timestamp": ev.get("recorded_at", datetime.now(timezone.utc)).isoformat()
                if hasattr(ev.get("recorded_at"), "isoformat")
                else str(ev.get("recorded_at", "")),
            })

        await _send_json(ws, {
            "event": "history",
            "count": len(history_payload),
            "anomalies": history_payload,
        })

        logger.info(
            "WS history replayed",
            extra={"tenant_id": tenant_id, "events_sent": len(history_payload)},
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("WS history replay failed", extra={"error": str(exc)})
        await _send_json(ws, {"event": "history", "count": 0, "anomalies": []})


async def _subscribe_and_forward(
    ws: WebSocket,
    tenant_id: str,
    stop_event: asyncio.Event,
) -> None:
    """
    Subscribe to the Redis anomaly pub/sub channel and forward messages
    to the WebSocket client until the stop_event is set.

    Only forwards messages that belong to the authenticated tenant.
    """
    pubsub: aioredis.client.PubSub | None = None
    redis_client: aioredis.Redis | None = None

    try:
        redis_client = await aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(settings.redis_anomaly_channel)

        logger.debug(
            "WS Redis subscription active",
            extra={"channel": settings.redis_anomaly_channel, "tenant_id": tenant_id},
        )

        while not stop_event.is_set():
            message = await pubsub.get_message(
                ignore_subscribe_messages=True,
                timeout=1.0,
            )
            if message and message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    # Tenant isolation: only forward messages for this tenant
                    if data.get("tenant_id") == tenant_id:
                        await _send_json(ws, data)
                except (json.JSONDecodeError, Exception):  # noqa: BLE001
                    pass

            # Yield to event loop
            await asyncio.sleep(0)

    except asyncio.CancelledError:
        pass
    except Exception as exc:  # noqa: BLE001
        logger.warning("WS Redis subscriber error", extra={"error": str(exc)})
    finally:
        if pubsub:
            try:
                await pubsub.unsubscribe(settings.redis_anomaly_channel)
                await pubsub.aclose()
            except Exception:  # noqa: BLE001
                pass
        if redis_client:
            try:
                await redis_client.aclose()
            except Exception:  # noqa: BLE001
                pass


async def _ping_loop(ws: WebSocket, stop_event: asyncio.Event) -> None:
    """Send a keep-alive ping every WS_PING_INTERVAL seconds."""
    while not stop_event.is_set():
        await asyncio.sleep(settings.ws_ping_interval)
        if stop_event.is_set():
            break
        await _send_json(ws, {
            "event": "ping",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })


# ─── WebSocket route ───────────────────────────────────────────────────────────

@router.websocket("/ws/inference/stream")
async def inference_stream(
    websocket: WebSocket,
    token: str | None = None,
) -> None:
    """
    WebSocket endpoint for real-time AI anomaly event streaming.

    Authentication:
        Pass JWT as ?token=<jwt> query parameter.
        The token is validated identically to HTTP Bearer tokens.
    """
    # ── Authentication ─────────────────────────────────────────────────────
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        logger.warning("WS connection rejected — no token provided")
        return

    try:
        claims = await authenticate_websocket_token(token)
    except (ValueError, PermissionError) as exc:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        logger.warning(
            "WS authentication failed",
            extra={"error": str(exc)},
        )
        return

    tenant_id: str = claims["tenant_id"]
    user_id: str = claims["user_id"]
    LogContext.set(tenant_id=tenant_id)

    # ── Accept connection ───────────────────────────────────────────────────
    await websocket.accept()
    ACTIVE_WEBSOCKET_CONNECTIONS.inc()

    logger.info(
        "WebSocket connection established",
        extra={"tenant_id": tenant_id, "user_id": user_id},
    )

    await _send_json(websocket, {
        "event": "connected",
        "message": "WebSocket connection established",
        "tenant_id": tenant_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # ── Replay history ──────────────────────────────────────────────────────
    await _replay_history(websocket, tenant_id)

    # ── Launch concurrent tasks ─────────────────────────────────────────────
    stop_event = asyncio.Event()

    subscriber_task = asyncio.create_task(
        _subscribe_and_forward(websocket, tenant_id, stop_event),
        name=f"ws-subscriber-{user_id}",
    )
    ping_task = asyncio.create_task(
        _ping_loop(websocket, stop_event),
        name=f"ws-ping-{user_id}",
    )

    # ── Wait for disconnect ─────────────────────────────────────────────────
    try:
        while True:
            # Wait for the client to send a message (acts as disconnect detector)
            try:
                msg = await asyncio.wait_for(
                    websocket.receive_text(), timeout=settings.ws_ping_interval + 5
                )
                # Clients may send "ping" messages; ignore gracefully
                if msg.strip().lower() == "ping":
                    await _send_json(websocket, {
                        "event": "pong",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
            except asyncio.TimeoutError:
                # No message received — connection is still alive (ping loop handles it)
                continue

    except WebSocketDisconnect:
        logger.info(
            "WebSocket disconnected",
            extra={"tenant_id": tenant_id, "user_id": user_id},
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "WebSocket error",
            extra={"tenant_id": tenant_id, "error": str(exc)},
        )
    finally:
        # ── Cleanup ────────────────────────────────────────────────────────
        stop_event.set()

        for task in (subscriber_task, ping_task):
            if not task.done():
                task.cancel()
                try:
                    await task
                except (asyncio.CancelledError, Exception):
                    pass

        ACTIVE_WEBSOCKET_CONNECTIONS.dec()

        logger.info(
            "WebSocket cleanup complete",
            extra={"tenant_id": tenant_id, "user_id": user_id},
        )
