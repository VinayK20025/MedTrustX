"""
MedTrustX Device Trust Agent — On-Demand Check Handler.

Listens on 127.0.0.1:9099 for trigger requests from zta-service.
Handles four endpoints:
  POST /attest              — run all 10 checks immediately
  POST /attest/check/{id}  — run single check by ID
  GET  /status              — return last cached TrustReport
  GET  /version             — return agent version info

SECURITY: Binds to 127.0.0.1 ONLY — never 0.0.0.0.
"""

from __future__ import annotations

import asyncio
import json
import os
from datetime import datetime, timezone
from typing import Optional

import structlog
from aiohttp import web

from src.models.trust_report import TrustReport

logger = structlog.get_logger(__name__)

BIND_HOST = "127.0.0.1"  # MUST remain loopback — never expose externally


class OnDemandHandler:
    """HTTP server handling on-demand attestation triggers from zta-service.

    All endpoints are accessible only from 127.0.0.1. The server uses
    aiohttp for async request handling without blocking the event loop.
    """

    def __init__(self) -> None:
        self._last_report: Optional[TrustReport] = None
        self._scheduler = None  # Set lazily to avoid circular import
        self._app = self._build_app()

    def _build_app(self) -> web.Application:
        """Build aiohttp Application with all route handlers."""
        app = web.Application()
        app.router.add_post("/attest", self._handle_attest)
        app.router.add_post("/attest/check/{check_id}", self._handle_attest_single)
        app.router.add_get("/status", self._handle_status)
        app.router.add_get("/version", self._handle_version)
        app.router.add_get("/health", self._handle_health)
        return app

    async def run_server(self) -> None:
        """Start the local HTTP server and run until cancelled."""
        from src.config import get_config
        config = get_config()

        bind_host = config.on_demand_bind_host  # validated to be 127.0.0.1
        bind_port = config.on_demand_bind_port

        logger.info(
            "on_demand_handler_starting",
            host=bind_host,
            port=bind_port,
        )

        runner = web.AppRunner(self._app)
        await runner.setup()
        site = web.TCPSite(runner, bind_host, bind_port)

        try:
            await site.start()
            logger.info(
                "on_demand_handler_listening",
                host=bind_host,
                port=bind_port,
            )
            # Keep running until cancelled
            while True:
                await asyncio.sleep(3600)
        except asyncio.CancelledError:
            logger.info("on_demand_handler_cancelled")
        finally:
            await runner.cleanup()

    def set_last_report(self, report: TrustReport) -> None:
        """Update the cached TrustReport. Called by ContinuousScheduler."""
        self._last_report = report

    # ── Route handlers ─────────────────────────────────────────────────────

    async def _handle_attest(self, request: web.Request) -> web.Response:
        """POST /attest — trigger a full 10-check attestation cycle."""
        logger.info(
            "on_demand_attest_triggered",
            remote=request.remote,
        )

        if request.remote not in ("127.0.0.1", "::1"):
            logger.warning("on_demand_unauthorized_remote", remote=request.remote)
            return web.Response(status=403, text="Forbidden")

        try:
            scheduler = self._get_scheduler()
            trust_report = await scheduler.run_single_cycle()
            self._last_report = trust_report
            return web.json_response(
                trust_report.to_zta_payload(),
                status=200,
            )
        except Exception as exc:
            logger.exception("on_demand_attest_failed", error=str(exc))
            return web.Response(status=500, text=f"Internal error: {exc}")

    async def _handle_attest_single(self, request: web.Request) -> web.Response:
        """POST /attest/check/{check_id} — run a single check by ID."""
        if request.remote not in ("127.0.0.1", "::1"):
            return web.Response(status=403, text="Forbidden")

        check_id_str = request.match_info.get("check_id", "")
        try:
            check_id = int(check_id_str)
        except ValueError:
            return web.Response(status=400, text=f"Invalid check_id: {check_id_str}")

        if not 1 <= check_id <= 10:
            return web.Response(status=400, text=f"check_id must be 1–10, got {check_id}")

        logger.info("on_demand_single_check_triggered", check_id=check_id)

        try:
            scheduler = self._get_scheduler()
            result = await scheduler.run_single_check(check_id)
            if result is None:
                return web.Response(status=404, text=f"Check {check_id} not found")
            return web.json_response(result.to_summary(), status=200)
        except Exception as exc:
            logger.exception("on_demand_single_check_failed", check_id=check_id, error=str(exc))
            return web.Response(status=500, text=f"Internal error: {exc}")

    async def _handle_status(self, request: web.Request) -> web.Response:
        """GET /status — return last cached TrustReport."""
        if request.remote not in ("127.0.0.1", "::1"):
            return web.Response(status=403, text="Forbidden")

        if self._last_report is None:
            return web.json_response(
                {"status": "no_report_yet", "message": "No check cycle has completed yet."},
                status=202,
            )
        return web.json_response(
            self._last_report.to_zta_payload(),
            status=200,
        )

    async def _handle_version(self, request: web.Request) -> web.Response:
        """GET /version — return agent version and build info."""
        if request.remote not in ("127.0.0.1", "::1"):
            return web.Response(status=403, text="Forbidden")

        from src.config import get_config
        config = get_config()
        from src.platform_detector import detect_platform
        platform_info = detect_platform()

        return web.json_response(
            {
                "agent_version": config.agent_version,
                "agent_mode": config.agent_mode,
                "platform": platform_info.platform.value,
                "os_version": platform_info.os_version,
                "python_version": platform_info.python_version,
                "device_id": config.agent_device_id,
                "tenant_id": config.agent_tenant_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            status=200,
        )

    async def _handle_health(self, request: web.Request) -> web.Response:
        """GET /health — simple liveness check."""
        return web.json_response({"status": "ok"}, status=200)

    def _get_scheduler(self):
        """Lazily import and cache the ContinuousScheduler instance."""
        if self._scheduler is None:
            from src.scheduler.continuous_scheduler import ContinuousScheduler
            self._scheduler = ContinuousScheduler()
        return self._scheduler
