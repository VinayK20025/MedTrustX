"""
Real-time Trust Scorer.
"""
from typing import Dict, Any
from uuid import UUID
import json
from datetime import datetime, timezone

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace

from app.db.repositories.device_repo import DeviceRepository
from app.db.repositories.auth_log_repo import AuthLogRepository
from app.services.opa_client import OPAClient
from app.models.trust import TrustScoreResponse

tracer = trace.get_tracer(__name__)

class TrustScorer:
    def __init__(self, session: AsyncSession, redis: Redis):
        self.device_repo = DeviceRepository(session)
        self.auth_log_repo = AuthLogRepository(session)
        self.redis = redis
        self.opa = OPAClient()

    async def compute(self, user_id: UUID, device_id: UUID, source_ip: str) -> TrustScoreResponse:
        with tracer.start_as_current_span("zta.trust.compute"):
            cache_key = f"medtrust:zta:trust:{user_id}:{device_id}"
            cached = await self.redis.get(cache_key)
            if cached:
                await self.opa.close()
                return TrustScoreResponse(**json.loads(cached))

            device = await self.device_repo.get_device_by_id(device_id)
            if not device:
                device = {"compliance_status": "unregistered", "patch_level": "unknown"}
                
            failed_attempts = await self.auth_log_repo.get_failed_attempts_24h(str(user_id))
            anomaly_score = await self.auth_log_repo.compute_anomaly_score(str(user_id))

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
                }
            }

            d_res = await self.opa.evaluate_device_trust(context) or {"score": 0.5}
            n_res = await self.opa.evaluate_network_trust(context) or {"score": 0.5}
            u_res = await self.opa.evaluate_user_trust(context) or {"score": 0.5}

            d_score = d_res.get("score", 0.0)
            n_score = n_res.get("score", 0.0)
            u_score = u_res.get("score", 0.0)

            combined_score = (d_score * 0.40) + (u_score * 0.35) + (n_score * 0.25)
            
            recommendation = "allow"
            if combined_score == 0.0:
                recommendation = "deny"
            elif combined_score < 0.8:
                recommendation = "step_up"

            resp = TrustScoreResponse(
                combined_score=combined_score,
                device_score=d_score,
                user_score=u_score,
                network_score=n_score,
                recommendation=recommendation
            )

            await self.redis.setex(cache_key, 300, resp.model_dump_json())
            await self.opa.close()
            return resp
