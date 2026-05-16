"""
Device Attestor. PEP/PDP pipeline for devices.
"""
import json
from uuid import UUID
from typing import Dict, Any

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace

from app.db.repositories.device_repo import DeviceRepository
from app.db.repositories.auth_log_repo import AuthLogRepository
from app.services.opa_client import OPAClient

tracer = trace.get_tracer(__name__)

class DeviceAttestor:
    def __init__(self, session: AsyncSession, redis: Redis):
        self.device_repo = DeviceRepository(session)
        self.auth_log_repo = AuthLogRepository(session)
        self.redis = redis
        self.opa = OPAClient()

    async def attest(self, device_id: UUID, mac_address: str, compliance_evidence: Dict[str, Any]) -> Dict[str, Any]:
        with tracer.start_as_current_span("zta.device.attest"):
            device = await self.device_repo.get_device_by_id(device_id)
            if not device or device["mac_address"] != mac_address:
                return {"trust_score": 0.0, "status": "unregistered"}

            old_status = device["compliance_status"]
            
            context = {"device": {
                "compliance_status": compliance_evidence.get("status", old_status),
                "patch_level": compliance_evidence.get("patch_level", device["patch_level"])
            }}
            
            result = await self.opa.evaluate_device_trust(context)
            if not result:
                result = {"trusted": False, "score": 0.0, "reason": "OPA failure"}
                new_status = "unregistered"
                if context["device"]["compliance_status"] == "compliant":
                    new_status = "compliant"
                    result["score"] = 1.0
            else:
                if result.get("score", 0.0) == 1.0:
                    new_status = "compliant"
                elif result.get("score", 0.0) == 0.0:
                    new_status = "jailbroken" if compliance_evidence.get("status") == "jailbroken" else "unregistered"
                else:
                    new_status = "missing_av"

            await self.device_repo.update_compliance(device_id, new_status, context["device"]["patch_level"])
            
            action = "attested"
            if new_status != old_status:
                await self.redis.publish("medtrust:zta:alerts", json.dumps({
                    "event": "device_trust_changed",
                    "device_id": str(device_id),
                    "old_status": old_status,
                    "new_status": new_status,
                    "trust_score": result.get("score", 0.0),
                    "action": "session_revoked" if new_status in ("jailbroken", "unregistered") else "updated",
                    "timestamp": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat()
                }))
                action = "status_changed"

            await self.auth_log_repo.insert_log(
                user_id=str(device["owner_user_id"]),
                device_id=str(device_id),
                tenant_id=str(device["tenant_id"]),
                endpoint="/api/zta/device/attest",
                query_attempted="ATTEST",
                source_ip="internal",
                action_taken=action,
                severity="medium" if new_status != "compliant" else "low",
                details=json.dumps({"old_status": old_status, "new_status": new_status})
            )
            
            await self.opa.close()
            
            return {
                "trust_score": result.get("score", 0.0),
                "status": new_status
            }
