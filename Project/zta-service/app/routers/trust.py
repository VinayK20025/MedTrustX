"""
Trust endpoint for ZTA evaluation.
"""
from fastapi import APIRouter, Depends, Request
from uuid import UUID

from app.models.trust import TrustScoreResponse, AccessEvaluationRequest, AccessDecision
from app.db.session import get_session
from app.services.trust_scorer import TrustScorer
from app.services.policy_fallback import PolicyFallbackEngine
from app.services.opa_client import OPAClient
from app.db.repositories.auth_log_repo import AuthLogRepository
from app.db.repositories.device_repo import DeviceRepository
from app.dependencies import get_redis

import json
from datetime import datetime, timezone

router = APIRouter(prefix="/api/zta", tags=["trust"])

@router.get("/device/{device_id}/trust", response_model=TrustScoreResponse)
async def get_device_trust(device_id: UUID, request: Request, session=Depends(get_session), redis=Depends(get_redis)):
    user_id = getattr(request.state, "user_id", "00000000-0000-0000-0000-000000000000")
    source_ip = request.client.host if request.client else "127.0.0.1"
    
    scorer = TrustScorer(session, redis)
    return await scorer.compute(UUID(str(user_id)), device_id, source_ip)

@router.post("/access/evaluate", response_model=AccessDecision)
async def evaluate_access(request_body: AccessEvaluationRequest, request: Request, session=Depends(get_session), redis=Depends(get_redis)):
    source_ip = request_body.source_ip or (request.client.host if request.client else "127.0.0.1")
    
    auth_repo = AuthLogRepository(session)
    device_repo = DeviceRepository(session)
    opa = OPAClient()
    
    device = await device_repo.get_device_by_id(request_body.device_id)
    if not device:
        device = {"compliance_status": "unregistered", "patch_level": "unknown"}
        
    failed_attempts = await auth_repo.get_failed_attempts_24h(str(request_body.user_id))
    anomaly_score = await auth_repo.compute_anomaly_score(str(request_body.user_id))
    
    context = {
        "device": {
            "compliance_status": device.get("compliance_status"),
            "patch_level": device.get("patch_level")
        },
        "network": {
            "source_ip": source_ip,
            "request_time_utc": datetime.now(timezone.utc).isoformat()
        },
        "user": {
            "failed_attempts_24h": failed_attempts,
            "anomaly_score": anomaly_score,
            "mfa_passed": True
        },
        "resource": request_body.resource,
        "action": request_body.action
    }
    
    result = await opa.evaluate_access(context)
    fallback_used = False
    
    if result:
        decision = AccessDecision(**result)
    else:
        fallback_used = True
        engine = PolicyFallbackEngine()
        decision = engine.evaluate(context)
        
    await auth_repo.insert_log(
        user_id=str(request_body.user_id),
        device_id=str(request_body.device_id),
        tenant_id=str(request_body.tenant_id),
        endpoint="/api/zta/access/evaluate",
        query_attempted=f"{request_body.action} {request_body.resource}",
        source_ip=source_ip,
        action_taken="allow" if decision.allow else "deny",
        severity="high" if not decision.allow else "low",
        details=json.dumps({"reason": decision.reason, "score": decision.trust_score, "fallback": fallback_used})
    )
    
    if not decision.allow:
        await redis.publish("medtrust:zta:alerts", json.dumps({
            "event": "access_denied",
            "user_id": str(request_body.user_id),
            "device_id": str(request_body.device_id),
            "resource": request_body.resource,
            "reason": decision.reason,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }))
        
    await opa.close()
    return decision
