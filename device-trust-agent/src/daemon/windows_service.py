"""
MedTrustX Device Trust Agent — Windows Service Daemon.

Implements a Windows Service via pywin32 so the agent runs as a
background service under the SYSTEM account. Handles start, stop,
and pause/resume lifecycle events.

Service name:    medtrustx-agent
Display name:    MedTrustX Device Trust Agent
Start type:      Automatic (delayed start)
Account:         LocalSystem
"""

from __future__ import annotations

import asyncio
import os
import sys
import threading
from pathlib import Path
from typing import Optional

import structlog

logger = structlog.get_logger(__name__)

# Guard import so the module can be imported on non-Windows for testing
if sys.platform == "win32":
    import win32service
    import win32serviceutil
    import win32event
    import servicemanager
    import pywintypes


class MedTrustXAgentService(  # type: ignore[misc]
    win32serviceutil.ServiceFramework if sys.platform == "win32" else object
):
    """Windows Service implementation for MedTrustX Device Trust Agent.

    Inherits from pywin32 ServiceFramework. On non-Windows platforms
    this class inherits from object to allow import without errors.
    """

    _svc_name_ = "medtrustx-agent"
    _svc_display_name_ = "MedTrustX Device Trust Agent"
    _svc_description_ = (
        "MedTrustX Zero Trust Device Attestation Agent. "
        "Performs continuous endpoint security checks and reports "
        "trust scores to the ZTA policy engine."
    )

    def __init__(self, args: tuple) -> None:
        if sys.platform == "win32":
            win32serviceutil.ServiceFramework.__init__(self, args)
            self._stop_event = win32event.CreateEvent(None, 0, 0, None)
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._scheduler_task: Optional[threading.Thread] = None
        self._running = False

    def SvcStop(self) -> None:  # noqa: N802
        """Called by Windows SCM to stop the service."""
        logger.info("windows_service_stop_requested")
        if sys.platform == "win32":
            self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
            win32event.SetEvent(self._stop_event)
        self._running = False
        if self._loop and self._loop.is_running():
            self._loop.call_soon_threadsafe(self._loop.stop)

    def SvcDoRun(self) -> None:  # noqa: N802
        """Called by Windows SCM to start the service. Blocks until stopped."""
        if sys.platform == "win32":
            servicemanager.LogMsg(
                servicemanager.EVENTLOG_INFORMATION_TYPE,
                servicemanager.PYS_SERVICE_STARTED,
                (self._svc_name_, ""),
            )
        logger.info("windows_service_starting", service_name=self._svc_name_)
        self._running = True
        self._run_agent()

    def _run_agent(self) -> None:
        """Bootstrap the asyncio event loop and start the scheduler."""
        try:
            self._loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self._loop)

            from src.scheduler.continuous_scheduler import ContinuousScheduler
            from src.scheduler.on_demand_handler import OnDemandHandler

            scheduler = ContinuousScheduler()
            on_demand = OnDemandHandler()

            async def run_all() -> None:
                await asyncio.gather(
                    scheduler.run_forever(),
                    on_demand.run_server(),
                )

            logger.info("windows_service_started")
            self._loop.run_until_complete(run_all())
        except Exception as exc:
            logger.exception("windows_service_run_failed", error=str(exc))
        finally:
            if self._loop:
                self._loop.close()
            logger.info("windows_service_stopped")


def install_service() -> None:
    """Register the Windows service with the SCM."""
    if sys.platform != "win32":
        raise RuntimeError("Windows service installation requires Windows.")
    win32serviceutil.InstallService(
        MedTrustXAgentService._svc_reg_class_,  # type: ignore[attr-defined]
        MedTrustXAgentService._svc_name_,
        MedTrustXAgentService._svc_display_name_,
        startType=win32service.SERVICE_AUTO_START,
        description=MedTrustXAgentService._svc_description_,
    )
    logger.info("windows_service_installed", name=MedTrustXAgentService._svc_name_)


def start_service() -> None:
    """Start the Windows service via SCM."""
    if sys.platform != "win32":
        raise RuntimeError("Windows service start requires Windows.")
    win32serviceutil.StartService(MedTrustXAgentService._svc_name_)
    logger.info("windows_service_start_requested")


def stop_service() -> None:
    """Stop the Windows service via SCM."""
    if sys.platform != "win32":
        raise RuntimeError("Windows service stop requires Windows.")
    win32serviceutil.StopService(MedTrustXAgentService._svc_name_)
    logger.info("windows_service_stop_requested")


if __name__ == "__main__" and sys.platform == "win32":
    win32serviceutil.HandleCommandLine(MedTrustXAgentService)
