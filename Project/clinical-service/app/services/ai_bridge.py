"""
AI Platform Integration Service.
"""
from typing import Dict, Any
import httpx
from opentelemetry import trace

from app.config import settings

tracer = trace.get_tracer(__name__)

class AIBridge:
    def __init__(self):
        self.base_url = settings.ai_service_url

    async def analyze_critical_result(self, alert_data: Dict[str, Any]) -> None:
        with tracer.start_as_current_span("ai.analyze_result"):
            try:
                async with httpx.AsyncClient(timeout=2) as client:
                    await client.post(f"{self.base_url}/api/ai/analyze-result", json=alert_data)
            except Exception:
                pass
