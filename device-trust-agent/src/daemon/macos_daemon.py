"""
MedTrustX Device Trust Agent — macOS LaunchDaemon Handler.

Handles macOS-specific daemon lifecycle signals (SIGTERM, SIGHUP) as
expected by launchd when running as a LaunchDaemon. Integrates with
the asyncio event loop started by main.py.

The LaunchDaemon plist at:
  /Library/LaunchDaemons/com.medtrustx.agent.plist
configures launchd to start this agent at boot with KeepAlive=true.
"""

from __future__ import annotations

import asyncio
import os
import signal
import sys
from typing import Optional

import structlog

logger = structlog.get_logger(__name__)


class MacOsDaemon:
    """Handles macOS launchd daemon lifecycle for the trust agent.

    Installs signal handlers for SIGTERM and SIGHUP so that launchd can
    cleanly stop and reload the agent. Uses asyncio signal handling to
    avoid blocking the event loop.
    """

    def __init__(self) -> None:
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._shutdown_event: Optional[asyncio.Event] = None
        self._reload_event: Optional[asyncio.Event] = None

    def setup_signal_handlers(self, loop: asyncio.AbstractEventLoop) -> None:
        """Install SIGTERM and SIGHUP handlers for the running event loop.

        Must be called after the event loop is set as the current loop.

        Args:
            loop: The running asyncio event loop.
        """
        self._loop = loop
        self._shutdown_event = asyncio.Event()
        self._reload_event = asyncio.Event()

        if sys.platform != "darwin":
            logger.debug("macos_daemon_signal_setup_skipped", platform=sys.platform)
            return

        try:
            loop.add_signal_handler(signal.SIGTERM, self._handle_sigterm)
            loop.add_signal_handler(signal.SIGHUP, self._handle_sighup)
            loop.add_signal_handler(signal.SIGINT, self._handle_sigterm)
            logger.info("macos_daemon_signal_handlers_installed")
        except (NotImplementedError, RuntimeError) as exc:
            # add_signal_handler not available in some environments
            logger.warning("macos_signal_handler_install_failed", error=str(exc))
            # Fall back to standard signal module
            signal.signal(signal.SIGTERM, lambda s, f: self._sync_sigterm())
            signal.signal(signal.SIGHUP, lambda s, f: self._sync_sighup())

    def _handle_sigterm(self) -> None:
        """Asyncio-safe SIGTERM handler — set shutdown event."""
        logger.info("macos_daemon_sigterm_received")
        if self._shutdown_event:
            self._loop.call_soon_threadsafe(self._shutdown_event.set)

    def _handle_sighup(self) -> None:
        """Asyncio-safe SIGHUP handler — set reload event."""
        logger.info("macos_daemon_sighup_received")
        if self._reload_event:
            self._loop.call_soon_threadsafe(self._reload_event.set)

    def _sync_sigterm(self) -> None:
        """Thread-safe SIGTERM fallback handler."""
        if self._loop and self._loop.is_running():
            self._loop.call_soon_threadsafe(self._handle_sigterm)

    def _sync_sighup(self) -> None:
        """Thread-safe SIGHUP fallback handler."""
        if self._loop and self._loop.is_running():
            self._loop.call_soon_threadsafe(self._handle_sighup)

    async def wait_for_shutdown(self) -> None:
        """Await until a SIGTERM shutdown signal is received."""
        if self._shutdown_event:
            await self._shutdown_event.wait()

    async def wait_for_reload(self) -> None:
        """Await until a SIGHUP reload signal is received, then clear it."""
        if self._reload_event:
            await self._reload_event.wait()
            self._reload_event.clear()

    def notify_ready(self) -> None:
        """Log that the daemon is ready — equivalent to sd_notify for launchd.

        launchd does not use sd_notify; instead it monitors the process.
        We write a ready marker to the log for operational visibility.
        """
        logger.info(
            "macos_daemon_ready",
            pid=os.getpid(),
            platform="macOS",
        )

    def run(self) -> None:
        """Bootstrap the asyncio event loop and run the agent as a macOS daemon."""
        logger.info("macos_daemon_starting", pid=os.getpid())

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self.setup_signal_handlers(loop)

        from src.scheduler.continuous_scheduler import ContinuousScheduler
        from src.scheduler.on_demand_handler import OnDemandHandler

        scheduler = ContinuousScheduler()
        on_demand = OnDemandHandler()

        async def run_all() -> None:
            self.notify_ready()
            await asyncio.gather(
                scheduler.run_forever(),
                on_demand.run_server(),
            )

        try:
            loop.run_until_complete(run_all())
        except KeyboardInterrupt:
            logger.info("macos_daemon_keyboard_interrupt")
        except Exception as exc:
            logger.exception("macos_daemon_run_failed", error=str(exc))
            sys.exit(1)
        finally:
            loop.close()
            logger.info("macos_daemon_stopped")
