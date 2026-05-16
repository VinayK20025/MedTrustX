from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Any, Dict
import asyncio
import json

from app.auth.pqc_jwt import validate_pqc_jwt
from app.dependencies import get_redis_client

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/rls/violations")
async def websocket_violations(websocket: WebSocket, token: str = Query(...)):
    await websocket.accept()
    
    try:
        # PQC JWT Auth
        payload = await validate_pqc_jwt(token)
        roles = payload.get("realm_access", {}).get("roles", [])
        if not roles and "roles" in payload:
            roles = payload["roles"]
            
        if "superadmin" not in roles and "compliance_officer" not in roles:
            await websocket.send_json({"error": "Unauthorized role"})
            await websocket.close(code=1008)
            return
            
        # Send last 20 violations from DB
        from app.db.sessions import get_raw_session
        from app.db.repositories.violation_repo import ViolationRepository
        session = await get_raw_session("clinical")
        try:
            repo = ViolationRepository(session)
            last_violations = await repo.get_violations(limit=20)
            for v in reversed(last_violations):
                v_dict = {
                    "event": "rls_violation",
                    "violation_id": str(v["id"]),
                    "timestamp": v["timestamp"].isoformat() if hasattr(v["timestamp"], "isoformat") else str(v["timestamp"]),
                    "violating_user_id": str(v["user_id"]),
                    "target_tenant_id": str(v["target_tenant_id"]),
                    "severity": v["severity"],
                    "action_taken": v["action_taken"],
                    "endpoint": v["endpoint"]
                }
                await websocket.send_json(v_dict)
        finally:
            await session.close()
            
        redis = get_redis_client()
        pubsub = redis.pubsub()
        await pubsub.subscribe("medtrust:rls:violations")
        
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
                        v_dict = {
                            "event": "rls_violation",
                            "violation_id": data.get("violation_id"),
                            "timestamp": data.get("timestamp"),
                            "violating_user_id": data.get("violating_user_id"),
                            "target_tenant_id": data.get("target_tenant_id"),
                            "severity": data.get("severity"),
                            "action_taken": data.get("action_taken"),
                            "endpoint": data.get("endpoint")
                        }
                        await websocket.send_json(v_dict)
                    except Exception:
                        pass
                
                # Check for client disconnect
                try:
                    await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                except asyncio.TimeoutError:
                    pass
                    
        except WebSocketDisconnect:
            pass
        finally:
            ping_task.cancel()
            await pubsub.unsubscribe("medtrust:rls:violations")
            await pubsub.close()
            
    except Exception as e:
        try:
            await websocket.send_json({"error": str(e)})
            await websocket.close(code=1008)
        except Exception:
            pass
