"""
Appointment Service WebSocket.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Optional
import json
import asyncio

from app.dependencies import get_redis
from app.auth.pqc_jwt import validate_pqc_jwt

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/appointments")
async def appointments_websocket(websocket: WebSocket, token: Optional[str] = None):
    await websocket.accept()
    
    if not token:
        await websocket.close(code=1008)
        return
        
    try:
        pqc_key = "default" 
        payload = await validate_pqc_jwt(token, pqc_key)
    except Exception:
        await websocket.close(code=1008)
        return
        
    redis = await get_redis()
    pubsub = redis.pubsub()
    
    await pubsub.subscribe("medtrust:operations:appointments")
    
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message:
                await websocket.send_text(message["data"])
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        await pubsub.unsubscribe("medtrust:operations:appointments")
    except Exception:
        pass
