"""
MedTrustX Device Trust Agent — Entry Point.

Bootstraps structured logging, detects platform, selects the
appropriate daemon mode (Windows Service / macOS LaunchDaemon /
Linux systemd), and launches the continuous scheduler.

CLI usage:
  medtrustx-agent run        — start as foreground process
  medtrustx-agent install    — install as OS service
  medtrustx-agent uninstall  — remove OS service
  medtrustx-agent status     — print last trust report
  medtrustx-agent version    — print version info
  medtrustx-agent check <n>  — run single check by ID (1–10)
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import click
import structlog


def _configure_logging(log_level: str = "INFO", log_format: str = "json") -> None:
    """Configure structlog for structured JSON or console output."""
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
    ]

    if log_format == "json":
        renderer = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer(colors=sys.stdout.isatty())

    structlog.configure(
        processors=shared_processors + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        processor=renderer,
        foreign_pre_chain=shared_processors,
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    # File handler if configured
    try:
        from src.config import get_config
        config = get_config()
        if config.log_file_path:
            log_dir = Path(config.log_file_path).parent
            log_dir.mkdir(parents=True, exist_ok=True)
            file_handler = logging.FileHandler(config.log_file_path)
            file_handler.setFormatter(formatter)
            logging.root.addHandler(file_handler)
    except Exception:
        pass

    logging.root.addHandler(handler)
    logging.root.setLevel(getattr(logging, log_level.upper(), logging.INFO))


logger = structlog.get_logger(__name__)


@click.group()
@click.option("--log-level", default="INFO", help="Log level (DEBUG/INFO/WARNING/ERROR)")
@click.option("--log-format", default="json", type=click.Choice(["json", "console"]))
@click.pass_context
def cli(ctx: click.Context, log_level: str, log_format: str) -> None:
    """MedTrustX Device Trust Agent — Zero Trust endpoint attestation."""
    _configure_logging(log_level, log_format)
    ctx.ensure_object(dict)
    ctx.obj["log_level"] = log_level


@cli.command("run")
@click.option("--foreground", is_flag=True, default=False, help="Run in foreground (non-daemon)")
@click.pass_context
def cmd_run(ctx: click.Context, foreground: bool) -> None:
    """Start the device trust agent."""
    from src.config import get_config
    from src.platform_detector import detect_platform, Platform

    try:
        config = get_config()
    except Exception as exc:
        click.echo(f"Configuration error: {exc}", err=True)
        sys.exit(1)

    platform_info = detect_platform()
    logger.info(
        "agent_starting",
        version=config.agent_version,
        platform=platform_info.platform.value,
        device_id=config.agent_device_id[:16] if config.agent_device_id else "not-set",
        pid=os.getpid(),
    )

    if foreground or platform_info.platform == Platform.LINUX:
        _run_linux_or_foreground(platform_info)
    elif platform_info.platform == Platform.WINDOWS:
        _run_windows()
    elif platform_info.platform == Platform.MACOS:
        _run_macos()
    else:
        # Fallback: run scheduler directly in asyncio loop
        asyncio.run(_run_async())


def _run_linux_or_foreground(platform_info: Any) -> None:
    """Run as Linux systemd daemon or foreground process."""
    from src.daemon.linux_daemon import LinuxDaemon
    daemon = LinuxDaemon()
    daemon.run()


def _run_windows() -> None:
    """Dispatch to Windows Service handler."""
    if sys.platform != "win32":
        _run_linux_or_foreground(None)
        return
    from src.daemon.windows_service import MedTrustXAgentService
    import win32serviceutil
    win32serviceutil.HandleCommandLine(MedTrustXAgentService)


def _run_macos() -> None:
    """Run as macOS LaunchDaemon."""
    from src.daemon.macos_daemon import MacOsDaemon
    daemon = MacOsDaemon()
    daemon.run()


async def _run_async() -> None:
    """Fallback: run scheduler and on-demand handler in asyncio loop."""
    from src.scheduler.continuous_scheduler import ContinuousScheduler
    from src.scheduler.on_demand_handler import OnDemandHandler

    scheduler = ContinuousScheduler()
    on_demand = OnDemandHandler()
    await asyncio.gather(
        scheduler.run_forever(),
        on_demand.run_server(),
    )


@cli.command("install")
@click.pass_context
def cmd_install(ctx: click.Context) -> None:
    """Install the agent as an OS service."""
    from src.platform_detector import detect_platform, Platform
    platform_info = detect_platform()

    if platform_info.platform == Platform.WINDOWS:
        if sys.platform != "win32":
            click.echo("Windows service install requires Windows.", err=True)
            sys.exit(1)
        from src.daemon.windows_service import install_service
        try:
            install_service()
            click.echo("Windows service installed successfully.")
        except Exception as exc:
            click.echo(f"Service install failed: {exc}", err=True)
            sys.exit(1)
    else:
        click.echo(
            "For Linux, copy medtrustx-agent.service to /etc/systemd/system/ "
            "and run: systemctl enable --now medtrustx-agent\n"
            "For macOS, copy com.medtrustx.agent.plist to /Library/LaunchDaemons/ "
            "and run: launchctl load -w /Library/LaunchDaemons/com.medtrustx.agent.plist"
        )


@cli.command("status")
@click.pass_context
def cmd_status(ctx: click.Context) -> None:
    """Print the last trust report from the running agent."""
    import urllib.request
    from src.config import get_config
    config = get_config()

    url = f"http://{config.on_demand_bind_host}:{config.on_demand_bind_port}/status"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            click.echo(json.dumps(data, indent=2, default=str))
    except Exception as exc:
        click.echo(f"Could not reach agent at {url}: {exc}", err=True)
        sys.exit(1)


@cli.command("version")
@click.pass_context
def cmd_version(ctx: click.Context) -> None:
    """Print agent version and platform information."""
    import urllib.request
    from src.config import get_config
    config = get_config()

    url = f"http://{config.on_demand_bind_host}:{config.on_demand_bind_port}/version"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            click.echo(json.dumps(data, indent=2))
    except Exception:
        # Agent not running — print from local detection
        from src.platform_detector import detect_platform
        pi = detect_platform()
        click.echo(
            json.dumps(
                {
                    "agent_version": config.agent_version,
                    "platform": pi.platform.value,
                    "os_version": pi.os_version,
                    "python_version": pi.python_version,
                },
                indent=2,
            )
        )


@cli.command("check")
@click.argument("check_id", type=click.IntRange(1, 10))
@click.pass_context
def cmd_check(ctx: click.Context, check_id: int) -> None:
    """Run a single check by ID (1–10) and print the result."""
    import urllib.request
    from src.config import get_config
    config = get_config()

    url = (
        f"http://{config.on_demand_bind_host}:{config.on_demand_bind_port}"
        f"/attest/check/{check_id}"
    )
    try:
        req = urllib.request.Request(url, method="POST", data=b"")
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            click.echo(json.dumps(data, indent=2, default=str))
    except Exception as exc:
        click.echo(f"Could not reach agent: {exc}", err=True)
        click.echo("Running check locally instead...")
        asyncio.run(_run_single_check_local(check_id))


async def _run_single_check_local(check_id: int) -> None:
    """Run a single check locally (without the running daemon)."""
    _configure_logging("INFO", "console")
    from src.scheduler.continuous_scheduler import ContinuousScheduler
    scheduler = ContinuousScheduler()
    result = await scheduler.run_single_check(check_id)
    if result:
        click.echo(json.dumps(result.to_summary(), indent=2, default=str))
    else:
        click.echo(f"Check {check_id} not found.", err=True)


# Type alias for platform_info parameter in _run_linux_or_foreground
from typing import Any  # noqa: E402


def cli_main() -> None:
    """Entry point registered in pyproject.toml [project.scripts]."""
    cli(obj={})


if __name__ == "__main__":
    cli_main()
