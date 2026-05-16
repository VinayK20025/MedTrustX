"""
Threat Detection and Blocking.
"""
import asyncio
from typing import Dict, Any, List
from collections import defaultdict
import redis.asyncio as redis_async

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.request_log_repo import RequestLogRepository
from app.db.repositories.threat_repo import ThreatRepository
from app.services.kong_admin import KongAdminClient
from app.config import settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

class ThreatIntelligence:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.request_repo = RequestLogRepository(session)
        self.threat_repo = ThreatRepository(session)
        self.kong = KongAdminClient()
        self.redis = redis_async.from_url(settings.redis_url)

    async def scan_for_ddos(self):
        logs = await self.request_repo.get_recent_logs(minutes=1)
        ip_counts = defaultdict(int)
        for log in logs:
            ip_counts[log.get("source_ip")] += 1
            
        for ip, count in ip_counts.items():
            if ip and count > 500:
                logger.warning("DDoS burst detected from IP: %s (req/min: %d)", ip, count)
                await self.threat_repo.log_threat("ddos_burst", ip, f"Requests per minute: {count}")
                await self._block_ip(ip, "DDoS burst detected")
                await self._publish_alert("ddos_burst", ip, count, "ip_blocked", "RATE_LIMIT_001")

    async def scan_for_credential_stuffing(self):
        logs = await self.request_repo.get_failed_auth_requests(minutes=1)
        ip_counts = defaultdict(int)
        for log in logs:
            ip_counts[log.get("source_ip")] += 1
            
        for ip, count in ip_counts.items():
            if ip and count > 10:
                logger.warning("Credential stuffing detected from IP: %s (fails/min: %d)", ip, count)
                await self.threat_repo.log_threat("credential_stuffing", ip, f"Failed auths per minute: {count}")
                await self._publish_alert("credential_stuffing", ip, count, "alert_only", "AUTH_001")

    async def scan_for_sqli(self):
        pass

    async def _block_ip(self, ip: str, reason: str):
        try:
            plugins = await self.kong.get_plugins()
            ip_plugin = next((p for p in plugins if p["name"] == "ip-restriction" and not p.get("route") and not p.get("service")), None)
            
            if ip_plugin:
                config = ip_plugin["config"]
                deny_list = config.get("deny", [])
                if ip not in deny_list:
                    deny_list.append(ip)
                    config["deny"] = deny_list
                    await self.kong.enable_plugin("ip-restriction", config)
            else:
                await self.kong.enable_plugin("ip-restriction", {"deny": [ip]})
        except Exception as e:
            logger.error("Failed to block IP in Kong: %s", str(e))

    async def _publish_alert(self, threat_type: str, ip: str, count: int, action: str, rule: str):
        msg = {
            "event": "threat_detected",
            "threat_type": threat_type,
            "source_ip": ip,
            "requests_per_min": count,
            "action_taken": action,
            "waf_rule": rule,
            "timestamp": asyncio.get_event_loop().time()
        }
        import json
        await self.redis.publish("medtrust:gateway:threats", json.dumps(msg))

    async def build_threat_report(self) -> Dict[str, Any]:
        recent_threats = await self.threat_repo.get_recent_threats(hours=24)
        
        counts_by_type = defaultdict(int)
        blocked_ips = set()
        
        for t in recent_threats:
            counts_by_type[t["threat_type"]] += 1
            if t["threat_type"] in ("ddos_burst", "sql_injection"):
                blocked_ips.add(t["source_ip"])
                
        from datetime import datetime
        return {
            "total_threats": len(recent_threats),
            "threat_counts_by_type": dict(counts_by_type),
            "recent_blocked_ips": list(blocked_ips),
            "timestamp": datetime.utcnow()
        }

async def threat_scanner_task(session_maker):
    while True:
        await asyncio.sleep(60)
        try:
            async with session_maker() as session:
                scanner = ThreatIntelligence(session)
                await scanner.scan_for_ddos()
                await scanner.scan_for_credential_stuffing()
        except Exception as e:
            logger.error("Threat scanner failed: %s", str(e))
