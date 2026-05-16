"""
ZTA WebSocket Alerts.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import asyncio
import json

from app.auth.pqc_jwt import validate_pqc_jwt
from app.dependencies import get_redis_client

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/zta/alerts")
async def websocket_alerts(websocket: WebSocket, token: str = Query(...)):
    await websocket.accept()
    try:
        payload = await validate_pqc_jwt(token)
        roles = payload.get("realm_access", {}).get("roles", [])
        if not roles and "roles" in payload:
            roles = payload["roles"]
            
        if "superadmin" not in roles and "IT_Admin" not in roles:
            await websocket.send_json({"error": "Unauthorized role"})
            await websocket.close(code=1008)
            return
            
        redis = get_redis_client()
        pubsub = redis.pubsub()
        await pubsub.subscribe("medtrust:zta:alerts")
        
        async def ping_loop():
            while True:
                await asyncio.sleep(30)
                try:
                    await websocket.send_json({"event": "ping"})
                except Exception:
                    break
                    
        ping_task = asyncio.create_task(ping_loop())
        
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message:
                    try:
                        data = json.loads(message["data"])
                        await websocket.send_json(data)
                    except Exception:
                        pass
                        
                try:
                    await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                except asyncio.TimeoutError:
                    pass
        except WebSocketDisconnect:
            pass
        finally:
            ping_task.cancel()
            await pubsub.unsubscribe("medtrust:zta:alerts")
            await pubsub.close()
            
    except Exception as e:
        try:
            await websocket.send_json({"error": str(e)})
            await websocket.close(code=1008)
        except Exception:
            pass
