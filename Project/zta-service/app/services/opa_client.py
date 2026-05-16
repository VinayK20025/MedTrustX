"""
OPA Client for evaluating access decisions.
"""
from typing import Dict, Any, Optional
import httpx
from opentelemetry import trace

from app.config import settings

tracer = trace.get_tracer(__name__)

class OPAClient:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=2.0)

    async def evaluate_access(self, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with tracer.start_as_current_span("zta.opa.evaluate") as span:
            try:
                response = await self.client.post(
                    f"{settings.opa_url}{settings.opa_policy_path}",
                    json={"input": context}
                )
                response.raise_for_status()
                result = response.json()
                return result.get("result")
            except httpx.TimeoutException:
                span.set_attribute("error", "timeout")
                return None
            except Exception as e:
                span.set_attribute("error", str(e))
                return None

    async def evaluate_device_trust(self, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with tracer.start_as_current_span("zta.opa.device_trust"):
            try:
                response = await self.client.post(
                    f"{settings.opa_url}/v1/data/medtrust/authz/device_result",
                    json={"input": context}
                )
                response.raise_for_status()
                return response.json().get("result")
            except Exception:
                return None
                
    async def evaluate_network_trust(self, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with tracer.start_as_current_span("zta.opa.network_trust"):
            try:
                response = await self.client.post(
                    f"{settings.opa_url}/v1/data/medtrust/authz/network_result",
                    json={"input": context}
                )
                response.raise_for_status()
                return response.json().get("result")
            except Exception:
                return None
                
    async def evaluate_user_trust(self, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with tracer.start_as_current_span("zta.opa.user_trust"):
            try:
                response = await self.client.post(
                    f"{settings.opa_url}/v1/data/medtrust/authz/user_result",
                    json={"input": context}
                )
                response.raise_for_status()
                return response.json().get("result")
            except Exception:
                return None

    async def close(self):
        await self.client.aclose()
