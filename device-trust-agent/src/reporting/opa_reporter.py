"""
MedTrustX Device Trust Agent — OPA Policy Engine Reporter.

Updates the OPA device context document before any session access
decision is made. OPA uses this data in access_decision.rego to
evaluate policy rules.

Endpoint: PUT {OPA_SERVICE_URL}/v1/data/medtrustx/devices/{device_id}
"""

from __future__ import annotations

import asyncio
import json
from typing import Any

import structlog

from src.models.trust_report import TrustReport
from src.reporting.base_reporter import BaseReporter

logger = structlog.get_logger(__name__)

REQUEST_TIMEOUT_SECONDS = 10.0


class OpaReporter(BaseReporter):
    """Updates OPA device context so policy decisions use current trust data.

    The OPA PUT must complete before any session grant is processed.
    This reporter is called synchronously relative to session issuance
    via the ZTA service coordination layer.
    """

    @property
    def reporter_name(self) -> str:
        return "opa-policy-engine"

    async def report(self, trust_report: TrustReport) -> None:
        """PUT device context document to OPA.

        Args:
            trust_report: Fully computed TrustReport.
        """
        await asyncio.get_event_loop().run_in_executor(
            None, self._update_opa_context, trust_report
        )

    def _update_opa_context(self, trust_report: TrustReport) -> None:
        """Perform synchronous HTTP PUT to OPA data API."""
        import urllib.request
        import urllib.error
        from src.config import get_config
        config = get_config()

        # OPA path: PUT /v1/data/medtrustx/devices/{device_id}
        # Encode device_id for URL safety
        import urllib.parse
        device_id_encoded = urllib.parse.quote(trust_report.device_id, safe="")
        url = (
            f"{config.opa_service_url}"
            f"{config.opa_device_data_path}"
            f"/{device_id_encoded}"
        )

        # Build OPA data document
        opa_document = trust_report.to_opa_document()
        # OPA data PUT wraps the document in {"result": {...}}
        body = json.dumps(opa_document).encode("utf-8")

        req = urllib.request.Request(
            url,
            data=body,
            method="PUT",
            headers={
                "Content-Type": "application/json",
                "Content-Length": str(len(body)),
            },
        )

        logger.info(
            "opa_context_updating",
            device_id=trust_report.device_id[:16],
            trust_level=trust_report.trust_level.value,
            score=trust_report.composite_score,
            url=url,
        )

        try:
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as resp:
                status = resp.status
                resp_body = resp.read().decode("utf-8", errors="replace")
                logger.info(
                    "opa_context_updated",
                    status_code=status,
                    device_id=trust_report.device_id[:16],
                    trust_level=trust_report.trust_level.value,
                )
        except urllib.error.HTTPError as exc:
            err_body = exc.read().decode("utf-8", errors="replace") if exc.fp else ""
            logger.error(
                "opa_context_update_http_error",
                status_code=exc.code,
                reason=exc.reason,
                response_body=err_body[:200],
                device_id=trust_report.device_id[:16],
            )
            raise
        except Exception as exc:
            logger.error(
                "opa_context_update_failed",
                error=str(exc),
                device_id=trust_report.device_id[:16],
            )
            raise

    def get_device_context(self, device_id: str) -> dict:
        """GET and return the current OPA device context document.

        Used for verification and testing purposes.

        Args:
            device_id: Device identifier to query.

        Returns:
            OPA document dict, or empty dict on error.
        """
        import urllib.request
        import urllib.parse
        from src.config import get_config
        config = get_config()

        device_id_encoded = urllib.parse.quote(device_id, safe="")
        url = (
            f"{config.opa_service_url}"
            f"{config.opa_device_data_path}"
            f"/{device_id_encoded}"
        )
        try:
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data.get("result", data)
        except Exception as exc:
            logger.warning("opa_get_context_failed", device_id=device_id[:16], error=str(exc))
            return {}
