"""
MedTrustX Device Trust Agent — Prometheus Pushgateway Reporter.

Pushes device trust metrics to the Prometheus Pushgateway for
aggregation by the Grafana/Prometheus observability stack.

Push URL: {PROMETHEUS_PUSHGATEWAY_URL}/metrics/job/{JOB_NAME}

Metrics pushed:
  device_trust_score          gauge   — composite trust score
  device_check_score          gauge   — per-check score
  device_trust_level          gauge   — trust level as 0–3 integer
  device_check_duration_ms    gauge   — per-check execution time
  device_blocked_total        counter — cumulative block events
  device_restricted_total     counter — cumulative restrict events
"""

from __future__ import annotations

import asyncio
from typing import Any

import structlog

from src.models.trust_level import TrustLevel
from src.models.trust_report import TrustReport
from src.reporting.base_reporter import BaseReporter

logger = structlog.get_logger(__name__)

# Trust level integer mapping for Prometheus gauge
TRUST_LEVEL_GAUGE = {
    TrustLevel.BLOCKED: 0,
    TrustLevel.RESTRICTED: 1,
    TrustLevel.STANDARD: 2,
    TrustLevel.TRUSTED: 3,
}


class PrometheusReporter(BaseReporter):
    """Pushes TrustReport metrics to Prometheus Pushgateway."""

    @property
    def reporter_name(self) -> str:
        return "prometheus-pushgateway"

    async def report(self, trust_report: TrustReport) -> None:
        """Push all device trust metrics to the Pushgateway."""
        await asyncio.get_event_loop().run_in_executor(
            None, self._push_metrics, trust_report
        )

    def _push_metrics(self, trust_report: TrustReport) -> None:
        """Build and push the Prometheus metrics payload."""
        from src.config import get_config
        config = get_config()

        labels = trust_report.to_prometheus_labels()
        device_id = labels["device_id"]
        tenant_id = labels["tenant_id"]
        platform = labels["platform"]
        agent_mode = labels["agent_mode"]

        # Build metrics text in Prometheus exposition format
        lines: list[str] = []

        # ── Composite trust score ──────────────────────────────────────────
        lines += [
            "# HELP device_trust_score Composite device trust score (0.0-10.0)",
            "# TYPE device_trust_score gauge",
            f'device_trust_score{{device_id="{device_id}",tenant_id="{tenant_id}",'
            f'platform="{platform}",agent_mode="{agent_mode}"}} '
            f"{trust_report.composite_score}",
        ]

        # ── Trust level as integer gauge ───────────────────────────────────
        trust_level_int = TRUST_LEVEL_GAUGE[trust_report.trust_level]
        lines += [
            "# HELP device_trust_level Trust level (0=BLOCKED,1=RESTRICTED,2=STANDARD,3=TRUSTED)",
            "# TYPE device_trust_level gauge",
            f'device_trust_level{{device_id="{device_id}",tenant_id="{tenant_id}",'
            f'level="{trust_report.trust_level.value}"}} {trust_level_int}',
        ]

        # ── Per-check scores ───────────────────────────────────────────────
        lines += [
            "# HELP device_check_score Individual check score (1.0-10.0)",
            "# TYPE device_check_score gauge",
        ]
        for check in trust_report.check_results:
            check_name_safe = check.check_name.lower().replace(" ", "_").replace("/", "_")
            lines.append(
                f'device_check_score{{device_id="{device_id}",tenant_id="{tenant_id}",'
                f'check_id="{check.check_id}",check_name="{check_name_safe}"}} {check.score}'
            )

        # ── Per-check execution duration ───────────────────────────────────
        lines += [
            "# HELP device_check_duration_ms Check execution duration in milliseconds",
            "# TYPE device_check_duration_ms gauge",
        ]
        for check in trust_report.check_results:
            check_name_safe = check.check_name.lower().replace(" ", "_").replace("/", "_")
            lines.append(
                f'device_check_duration_ms{{device_id="{device_id}",tenant_id="{tenant_id}",'
                f'check_id="{check.check_id}",check_name="{check_name_safe}"}} {check.duration_ms}'
            )

        # ── Block / restrict event counters ────────────────────────────────
        if trust_report.trust_level == TrustLevel.BLOCKED:
            override_reason = (trust_report.override_reason or "policy").replace('"', "'")
            lines += [
                "# HELP device_blocked_total Total number of times device was blocked",
                "# TYPE device_blocked_total counter",
                f'device_blocked_total{{device_id="{device_id}",tenant_id="{tenant_id}",'
                f'reason="{override_reason[:64]}"}} 1',
            ]

        if trust_report.trust_level == TrustLevel.RESTRICTED:
            lines += [
                "# HELP device_restricted_total Total number of times device was restricted",
                "# TYPE device_restricted_total counter",
                f'device_restricted_total{{device_id="{device_id}",tenant_id="{tenant_id}",'
                f'reason="trust_score_below_threshold"}} 1',
            ]

        # ── Agent metadata ─────────────────────────────────────────────────
        lines += [
            "# HELP device_agent_info Static agent metadata",
            "# TYPE device_agent_info gauge",
            f'device_agent_info{{device_id="{device_id}",tenant_id="{tenant_id}",'
            f'version="{trust_report.agent_version}",platform="{platform}"}} 1',
        ]

        metrics_text = "\n".join(lines) + "\n"

        # Push to Pushgateway
        push_url = (
            f"{config.prometheus_pushgateway_url}/metrics/job/"
            f"{config.prometheus_job_name}/instance/{device_id[:32]}"
        )

        self._http_push(push_url, metrics_text)

    def _http_push(self, url: str, metrics_text: str) -> None:
        """HTTP PUT the metrics payload to the Pushgateway."""
        import urllib.request
        import urllib.error

        data = metrics_text.encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            method="PUT",
            headers={
                "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
                "Content-Length": str(len(data)),
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                status = resp.status
                logger.info(
                    "prometheus_push_success",
                    url=url,
                    status_code=status,
                    bytes_sent=len(data),
                )
        except urllib.error.HTTPError as exc:
            logger.error(
                "prometheus_push_http_error",
                url=url,
                status_code=exc.code,
                reason=exc.reason,
            )
            raise
        except Exception as exc:
            logger.error("prometheus_push_failed", url=url, error=str(exc))
            raise
