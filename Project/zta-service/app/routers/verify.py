"""
Continuous Verification endpoint.
"""
from fastapi import APIRouter, Depends
from app.models.verification import ContinuousVerifyRequest, VerificationResult
from app.services.continuous_verifier import ContinuousVerifier
from app.db.session import get_session
from app.dependencies import get_redis

router = APIRouter(prefix="/api/zta/verify", tags=["verify"])

@router.post("/continuous", response_model=VerificationResult)
async def continuous_verify(request_body: ContinuousVerifyRequest, session=Depends(get_session), redis=Depends(get_redis)):
    verifier = ContinuousVerifier(session, redis)
    
    needs_reverify = await verifier.should_reverify(request_body.session_id, request_body.source_ip)
    
    if needs_reverify:
        return await verifier.reverify(
            request_body.session_id,
            request_body.user_id,
            request_body.device_id,
            request_body.source_ip
        )
    else:
        cached = await redis.get(f"medtrust:zta:trust:{request_body.user_id}:{request_body.device_id}")
        score = 1.0
        if cached:
            import json
            score = json.loads(cached).get("combined_score", 1.0)
            
        return VerificationResult(
            next_check_in_seconds=900,
            action="continue",
            trust_score=score
        )
