"""
MedTrustX Device Trust Agent — Linux systemd Daemon Handler.

Handles systemd service lifecycle integration: sd_notify READY=1,
WATCHDOG keep-alive, STOPPING=1 on shutdown, and RELOADING=1 on
SIGHUP. Uses the sdnotify library when available.

The systemd unit at:
  /etc/systemd/system/medtrustx-agent.service
configures the service with Type=notify and WatchdogSec=30s.
"""

from __future__ import annotations

import asyncio
import os
import signal
import socket
import sys
import time
from pathlib import Path
from typing import Optional

import structlog

logger = structlog.get_logger(__name__)

# Systemd watchdog interval as fraction of WatchdogSec
WATCHDOG_FRACTION = 0.5


class LinuxDaemon:
    """Handles Linux systemd daemon lifecycle for the trust agent.

    Provides sd_notify integration (READY, WATCHDOG, STOPPING, RELOADING)
    and asyncio signal handlers for SIGTERM and SIGHUP.
    """

    def __init__(self) -> None:
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._shutdown_event: Optional[asyncio.Event] = None
        self._watchdog_task: Optional[asyncio.Task] = None
        self._watchdog_usec: int = self._get_watchdog_usec()

    def setup_signal_handlers(self, loop: asyncio.AbstractEventLoop) -> None:
        """Install SIGTERM and SIGHUP handlers for the asyncio loop.

        Args:
            loop: The running asyncio event loop.
        """
        self._loop = loop
        self._shutdown_event = asyncio.Event()

        if sys.platform != "linux":
            return

        try:
            loop.add_signal_handler(signal.SIGTERM, self._handle_sigterm)
            loop.add_signal_handler(signal.SIGHUP, self._handle_sighup)
            loop.add_signal_handler(signal.SIGINT, self._handle_sigterm)
            logger.info("linux_daemon_signal_handlers_installed")
        except (NotImplementedError, RuntimeError) as exc:
            logger.warning("linux_signal_handler_install_failed", error=str(exc))
            signal.signal(signal.SIGTERM, lambda s, f: self._sync_sigterm())
            signal.signal(signal.SIGHUP, lambda s, f: self._sync_sighup())

    def _handle_sigterm(self) -> None:
        """Asyncio SIGTERM handler — notify systemd and set shutdown event."""
        logger.info("linux_daemon_sigterm_received")
        self._sd_notify("STOPPING=1")
        if self._shutdown_event and self._loop:
            self._loop.call_soon_threadsafe(self._shutdown_event.set)

    def _handle_sighup(self) -> None:
        """Asyncio SIGHUP handler — notify systemd RELOADING then READY."""
        logger.info("linux_daemon_sighup_received")
        self._sd_notify("RELOADING=1")
        # Clear any cached config
        try:
            from src.config import get_config
            get_config.cache_clear()
        except Exception:
            pass
        self._sd_notify(f"READY=1\nSTATUS=Reloaded configuration")

    def _sync_sigterm(self) -> None:
        """Thread-safe SIGTERM fallback."""
        if self._loop and self._loop.is_running():
            self._loop.call_soon_threadsafe(self._handle_sigterm)

    def _sync_sighup(self) -> None:
        """Thread-safe SIGHUP fallback."""
        if self._loop and self._loop.is_running():
            self._loop.call_soon_threadsafe(self._handle_sighup)

    def notify_ready(self) -> None:
        """Send sd_notify READY=1 to inform systemd the agent is operational."""
        self._sd_notify(f"READY=1\nSTATUS=Device trust agent running (PID {os.getpid()})")
        logger.info("linux_daemon_ready_notified", pid=os.getpid())

    async def run_watchdog(self) -> None:
        """Periodically send WATCHDOG=1 keep-alive to systemd.

        Runs until the shutdown event is set. Interval is half the
        configured WatchdogSec so we always notify in time.
        """
        if self._watchdog_usec <= 0:
            logger.debug("linux_daemon_watchdog_disabled")
            return

        interval_seconds = (self._watchdog_usec / 1_000_000) * WATCHDOG_FRACTION
        logger.info(
            "linux_daemon_watchdog_started",
            interval_seconds=interval_seconds,
            watchdog_usec=self._watchdog_usec,
        )

        while not (self._shutdown_event and self._shutdown_event.is_set()):
            self._sd_notify("WATCHDOG=1")
            await asyncio.sleep(interval_seconds)

    async def wait_for_shutdown(self) -> None:
        """Await shutdown signal."""
        if self._shutdown_event:
            await self._shutdown_event.wait()

    def run(self) -> None:
        """Bootstrap the asyncio event loop and run the agent as a systemd daemon."""
        logger.info("linux_daemon_starting", pid=os.getpid())

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
                self.run_watchdog(),
            )

        try:
            loop.run_until_complete(run_all())
        except KeyboardInterrupt:
            logger.info("linux_daemon_keyboard_interrupt")
        except Exception as exc:
            logger.exception("linux_daemon_run_failed", error=str(exc))
            sys.exit(1)
        finally:
            self._sd_notify("STOPPING=1")
            loop.close()
            logger.info("linux_daemon_stopped")

    # ── sd_notify implementation ───────────────────────────────────────────

    @staticmethod
    def _get_watchdog_usec() -> int:
        """Read WATCHDOG_USEC from environment (set by systemd)."""
        val = os.environ.get("WATCHDOG_USEC", "0")
        try:
            return int(val)
        except ValueError:
            return 0

    @staticmethod
    def _sd_notify(state: str) -> None:
        """Send a sd_notify message to the systemd socket.

        Tries sdnotify library first, falls back to direct socket write.

        Args:
            state: Newline-separated sd_notify state string (e.g. "READY=1").
        """
        try:
            import sdnotify  # type: ignore[import]
            n = sdnotify.SystemdNotifier()
            # sdnotify expects single assignments — send each line separately
            for line in state.splitlines():
                if "=" in line:
                    key, _, value = line.partition("=")
                    n.notify(line)
            return
        except ImportError:
            pass

        # Direct socket fallback
        notify_socket = os.environ.get("NOTIFY_SOCKET")
        if not notify_socket:
            return
        try:
            if notify_socket.startswith("@"):
                # Abstract namespace socket
                notify_socket = "\0" + notify_socket[1:]
            with socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM) as sock:
                sock.connect(notify_socket)
                sock.sendall(state.encode("utf-8"))
        except Exception as exc:
            logger.debug("sd_notify_send_failed", state=state, error=str(exc))
