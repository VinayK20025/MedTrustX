"""
MFA Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, Any
from uuid import UUID

from app.db.session import get_session
from app.dependencies import get_redis
from app.services.mfa_manager import MFAManager
from pydantic import BaseModel

class MFAUserIdReq(BaseModel):
    user_id: UUID

class MFATotpVerifyReq(BaseModel):
    user_id: UUID
    totp_code: str
    
class MFAFido2CompleteReq(BaseModel):
    user_id: UUID
    credential: Dict[str, Any]
    
class MFAFido2AuthReq(BaseModel):
    user_id: UUID
    assertion: Dict[str, Any]

router = APIRouter(prefix="/api/iam/mfa", tags=["mfa"])

@router.post("/totp/enroll")
async def enroll_totp(req: MFAUserIdReq, session=Depends(get_session), redis=Depends(get_redis)):
    manager = MFAManager(session, redis)
    return await manager.enroll_totp(req.user_id, "user")

@router.post("/totp/verify")
async def verify_totp(req: MFATotpVerifyReq, session=Depends(get_session), redis=Depends(get_redis)):
    manager = MFAManager(session, redis)
    valid = await manager.verify_totp(req.user_id, req.totp_code)
    return {"valid": valid, "session_token": "mock_token" if valid else None}

@router.post("/fido2/register/begin")
async def fido2_register_begin(req: MFAUserIdReq, session=Depends(get_session), redis=Depends(get_redis)):
    manager = MFAManager(session, redis)
    return await manager.fido2_register_begin(req.user_id, "user")

@router.post("/fido2/register/complete")
async def fido2_register_complete(req: MFAFido2CompleteReq, session=Depends(get_session), redis=Depends(get_redis)):
    manager = MFAManager(session, redis)
    return await manager.fido2_register_complete(req.user_id, req.credential)

@router.post("/fido2/authenticate/begin")
async def fido2_auth_begin(req: MFAUserIdReq, session=Depends(get_session), redis=Depends(get_redis)):
    manager = MFAManager(session, redis)
    return await manager.fido2_auth_begin(req.user_id)

@router.post("/fido2/authenticate/complete")
async def fido2_auth_complete(req: MFAFido2AuthReq, session=Depends(get_session), redis=Depends(get_redis)):
    manager = MFAManager(session, redis)
    valid = await manager.fido2_auth_complete(req.user_id, req.assertion)
    return {"authenticated": valid, "session_token": "mock_token" if valid else None}
