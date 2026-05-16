"""
Sessions Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from uuid import UUID

from app.models.session import SessionCreateRequest, SessionResponse, SessionRefreshRequest
from app.db.session import get_session
from app.dependencies import get_redis
from app.services.session_manager import SessionManager

router = APIRouter(prefix="/api/iam/sessions", tags=["sessions"])

@router.post("", response_model=SessionResponse)
async def create_session(request_body: SessionCreateRequest, request: Request, session=Depends(get_session), redis=Depends(get_redis)):
    manager = SessionManager(session, redis)
    ip_address = request.client.host if request.client else "127.0.0.1"
    
    try:
        res = await manager.create_session(
            request_body.user_id, request_body.device_id, 
            request_body.mfa_method_used, ip_address
        )
        return SessionResponse(**res)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/refresh", response_model=SessionResponse)
async def refresh_session(request_body: SessionRefreshRequest, request: Request, session=Depends(get_session), redis=Depends(get_redis)):
    manager = SessionManager(session, redis)
    session_id_str = await redis.get(f"medtrust:iam:refresh:{request_body.refresh_token}")
    
    if not session_id_str or session_id_str != str(request_body.session_id):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    sess_obj = await manager.session_repo.get_session(request_body.session_id)
    if not sess_obj:
        raise HTTPException(status_code=401, detail="Session expired or revoked")
        
    ip_address = request.client.host if request.client else "127.0.0.1"
    await manager.session_repo.update_session_activity(request_body.session_id, ip_address)
    
    roles = await manager.role_repo.get_user_roles(sess_obj["user_id"])
    role_names = [r["name"] for r in roles]
    
    from app.auth.pqc_jwt import create_pqc_jwt
    token_claims = {
        "sub": str(sess_obj["user_id"]),
        "tenant_id": str(sess_obj["tenant_id"]),
        "roles": role_names,
        "device_id": str(sess_obj["device_id"]),
        "trust_score": 1.0,
        "session_id": str(sess_obj["id"])
    }
    access_token = create_pqc_jwt(token_claims)
    
    return SessionResponse(
        session_id=sess_obj["id"],
        access_token=access_token,
        refresh_token=request_body.refresh_token,
        expires_at=sess_obj["expires_at"]
    )

@router.delete("/{session_id}")
async def revoke_session(session_id: UUID, session=Depends(get_session), redis=Depends(get_redis)):
    manager = SessionManager(session, redis)
    await manager.revoke_session(session_id)
    return {"status": "revoked"}
