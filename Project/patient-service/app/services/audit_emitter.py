"""
Audit Event Emitter Service.
"""
from typing import Dict, Any, Optional
import httpx
from datetime import datetime, timezone
from opentelemetry import trace

from app.config import settings

tracer = trace.get_tracer(__name__)

class AuditEmitter:
    def __init__(self):
        self.base_url = settings.audit_service_url

    async def emit(self, tenant_id: str, user_id: str, action: str, resource_type: str, resource_id: str, details: Dict[str, Any], ip_address: Optional[str] = None):
        with tracer.start_as_current_span("audit.emit"):
            payload = {
                "tenant_id": tenant_id,
                "user_id": user_id,
                "action": action,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "details": details,
                "ip_address": ip_address or "0.0.0.0"
            }
            
            try:
                async with httpx.AsyncClient(timeout=2) as client:
                    await client.post(f"{self.base_url}/api/audit/events", json=payload)
            except Exception as e:
                pass
