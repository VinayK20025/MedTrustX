"""
Gateway WebSockets.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import redis.asyncio as redis_async
import json

from app.config import settings
from app.auth.pqc_jwt import validate_pqc_jwt

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/gateway/threats")
async def threat_stream(websocket: WebSocket, token: str):
    try:
        payload = await validate_pqc_jwt(token, pqc_session_key="ws-skip")
        roles = payload.get("realm_access", {}).get("roles", [])
        if "IT_Admin" not in roles and "superadmin" not in roles:
            await websocket.close(code=1008, reason="Unauthorized")
            return
            
        await websocket.accept()
        redis = redis_async.from_url(settings.redis_url)
        pubsub = redis.pubsub()
        await pubsub.subscribe("medtrust:gateway:threats")
        
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                await websocket.send_json(data)
                
    except Exception as e:
        await websocket.close(code=1008, reason=str(e))
