"""
WebSocket Stream for Audit Service.
"""
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from opentelemetry import trace

from app.auth.pqc_jwt import validate_pqc_jwt
from app.dependencies import get_redis

router = APIRouter(tags=["websocket"])
tracer = trace.get_tracer(__name__)

@router.websocket("/ws/audit/stream")
async def audit_stream(websocket: WebSocket, token: str, redis=Depends(get_redis)):
    try:
        payload = await validate_pqc_jwt(token, pqc_session_key="ws-fallback-key-or-from-query")
        
        roles = payload.get("realm_access", {}).get("roles", [])
        if "compliance_officer" not in roles and "superadmin" not in roles and "dpo" not in roles:
            await websocket.close(code=1008)
            return
            
        await websocket.accept()
        
        pubsub = redis.pubsub()
        await pubsub.subscribe("medtrust:audit:events", "medtrust:breach:incidents")
        
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    await websocket.send_json(data)
        except WebSocketDisconnect:
            pass
        finally:
            await pubsub.unsubscribe()
            
    except Exception:
        await websocket.close(code=1008)
