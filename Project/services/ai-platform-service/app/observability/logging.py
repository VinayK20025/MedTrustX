"""
app/observability/logging.py
============================
Structured JSON logging for the MedTrustX AI Platform Service.

Every log record is emitted as a single-line JSON object containing:
  - timestamp    (ISO-8601, UTC)
  - level        (DEBUG / INFO / WARNING / ERROR / CRITICAL)
  - service      (service_name from config)
  - environment  (development / staging / production)
  - logger       (Python logger name)
  - message      (human-readable log message)
  - tenant_id    (injected via LogContext context-var, default "system")
  - patient_id   (injected via LogContext context-var, default None)
  - trace_id     (injected from OpenTelemetry active span, default None)
  - span_id      (injected from OpenTelemetry active span, default None)
  - **extra      (any additional fields passed at call-site)

Log shipping pipeline:
  ┌─────────────────┐   StreamHandler    ┌──────────────────┐
  │  Python Logger  │ ─────────────────► │  stdout (Docker) │
  │                 │                    └──────────────────┘
  │                 │   LokiHttpHandler  ┌──────────────────┐
  │                 │ ─────────────────► │  Loki push API   │
  └─────────────────┘                    └──────────────────┘

Usage:
    from app.observability.logging import get_logger, LogContext

    logger = get_logger(__name__)

    # Set per-request context (typically in auth middleware):
    LogContext.set(tenant_id="tenant_apollo", patient_id="uuid-xxx")

    logger.info("Inference complete", extra={"model": "readmission", "latency_ms": 42})
"""

from __future__ import annotations

import asyncio
import json
import logging
import queue
import threading
import time
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any

import httpx
from pythonjsonlogger import jsonlogger

from app.config import settings

# ─── Per-request context variables ────────────────────────────────────────────
# These are set in the auth middleware and read by the log formatter so that
# every log emitted within a request automatically includes tenant/patient context.
_ctx_tenant_id: ContextVar[str] = ContextVar("tenant_id", default="system")
_ctx_patient_id: ContextVar[str | None] = ContextVar("patient_id", default=None)
_ctx_trace_id: ContextVar[str | None] = ContextVar("trace_id", default=None)
_ctx_span_id: ContextVar[str | None] = ContextVar("span_id", default=None)


class LogContext:
    """
    Static helper to get/set per-request logging context variables.

    Call ``LogContext.set(...)`` in the auth middleware immediately after
    validating the JWT, so all downstream log calls carry the right context.
    """

    @staticmethod
    def set(
        tenant_id: str = "system",
        patient_id: str | None = None,
        trace_id: str | None = None,
        span_id: str | None = None,
    ) -> None:
        """Bind context variables for the current async task / coroutine."""
        _ctx_tenant_id.set(tenant_id)
        _ctx_patient_id.set(patient_id)
        _ctx_trace_id.set(trace_id)
        _ctx_span_id.set(span_id)

    @staticmethod
    def get() -> dict[str, Any]:
        """Return the current context as a plain dict for log injection."""
        return {
            "tenant_id": _ctx_tenant_id.get(),
            "patient_id": _ctx_patient_id.get(),
            "trace_id": _ctx_trace_id.get(),
            "span_id": _ctx_span_id.get(),
        }


# ─── Custom JSON log formatter ─────────────────────────────────────────────────
class MedTrustJsonFormatter(jsonlogger.JsonFormatter):
    """
    Extends python-json-logger's JsonFormatter to inject:
      - UTC ISO-8601 timestamp
      - service, environment fields from config
      - per-request tenant_id, patient_id, trace_id, span_id from ContextVar
      - OpenTelemetry active span IDs (if OTel is instrumented)
    """

    def add_fields(
        self,
        log_record: dict[str, Any],
        record: logging.LogRecord,
        message_dict: dict[str, Any],
    ) -> None:
        super().add_fields(log_record, record, message_dict)

        # ── Timestamp ────────────────────────────────────────────────────────
        log_record["timestamp"] = datetime.now(timezone.utc).isoformat()

        # ── Normalise level ──────────────────────────────────────────────────
        log_record["level"] = record.levelname

        # ── Service identity ─────────────────────────────────────────────────
        log_record["service"] = settings.service_name
        log_record["environment"] = settings.environment
        log_record["logger"] = record.name

        # ── Per-request context (from ContextVar) ────────────────────────────
        ctx = LogContext.get()
        log_record["tenant_id"] = ctx["tenant_id"]
        if ctx["patient_id"] is not None:
            log_record["patient_id"] = ctx["patient_id"]

        # ── OpenTelemetry span correlation ───────────────────────────────────
        # Try to pull from OTel active span first; fall back to ContextVar.
        try:
            from opentelemetry import trace as otel_trace  # type: ignore

            span = otel_trace.get_current_span()
            span_ctx = span.get_span_context()
            if span_ctx.is_valid:
                log_record["trace_id"] = format(span_ctx.trace_id, "032x")
                log_record["span_id"] = format(span_ctx.span_id, "016x")
            else:
                log_record["trace_id"] = ctx["trace_id"]
                log_record["span_id"] = ctx["span_id"]
        except Exception:  # noqa: BLE001 — OTel not yet initialised
            log_record["trace_id"] = ctx["trace_id"]
            log_record["span_id"] = ctx["span_id"]

        # ── Remove redundant fields added by the base class ──────────────────
        for key in ("color_message", "taskName"):
            log_record.pop(key, None)


# ─── Loki HTTP handler ─────────────────────────────────────────────────────────
class LokiHttpHandler(logging.Handler):
    """
    Asynchronous HTTP log handler that ships structured JSON log entries to
    Grafana Loki via its push API.

    Log records are accumulated in a thread-safe queue.  A background daemon
    thread flushes the queue either when it reaches ``batch_size`` or after
    ``flush_interval`` seconds — whichever comes first.  This prevents Loki
    latency from blocking the request path.

    If Loki is unreachable the handler silently drops the batch to avoid
    cascading failures (observability must never take down the service).
    """

    def __init__(
        self,
        loki_url: str,
        batch_size: int = 10,
        flush_interval: float = 5.0,
        labels: dict[str, str] | None = None,
    ) -> None:
        super().__init__()
        self._loki_url = loki_url
        self._batch_size = batch_size
        self._flush_interval = flush_interval
        self._labels: dict[str, str] = labels or {
            "service": settings.service_name,
            "environment": settings.environment,
            "job": "medtrust-ai-platform",
        }
        self._queue: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=10_000)
        self._client = httpx.Client(timeout=3.0)

        # Background flush thread (daemon → exits when main process exits)
        self._flush_thread = threading.Thread(
            target=self._flush_loop, daemon=True, name="loki-flush"
        )
        self._flush_thread.start()

    # ── logging.Handler interface ─────────────────────────────────────────────
    def emit(self, record: logging.LogRecord) -> None:
        """Enqueue the formatted log entry for async Loki shipping."""
        try:
            formatted = self.format(record)
            entry: dict[str, Any] = {
                "ts": str(int(time.time_ns())),  # nanosecond Unix timestamp
                "line": formatted,
            }
            self._queue.put_nowait(entry)
        except queue.Full:
            # Queue saturated — drop entry to protect the application
            pass
        except Exception:  # noqa: BLE001
            self.handleError(record)

    def close(self) -> None:
        """Flush remaining entries and close the HTTP client."""
        self._drain()
        self._client.close()
        super().close()

    # ── Internal helpers ──────────────────────────────────────────────────────
    def _flush_loop(self) -> None:
        """Background thread: flush every ``flush_interval`` seconds."""
        while True:
            time.sleep(self._flush_interval)
            self._drain()

    def _drain(self) -> None:
        """Collect all queued entries and POST them to Loki in one batch."""
        entries: list[list[str]] = []
        try:
            while not self._queue.empty() and len(entries) < self._batch_size * 10:
                item = self._queue.get_nowait()
                entries.append([item["ts"], item["line"]])
        except queue.Empty:
            pass

        if not entries:
            return

        payload = {
            "streams": [
                {
                    "stream": self._labels,
                    "values": entries,
                }
            ]
        }
        try:
            response = self._client.post(
                self._loki_url,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            # 204 No Content is the normal Loki success response
            response.raise_for_status()
        except Exception:  # noqa: BLE001 — Loki unavailable; silently discard
            pass


# ─── Logger factory ────────────────────────────────────────────────────────────
_configured: bool = False


def _configure_root_logger() -> None:
    """
    Configure the root Python logger once per process.

    Called automatically on first ``get_logger()`` invocation.
    Idempotent — subsequent calls are no-ops.
    """
    global _configured  # noqa: PLW0603
    if _configured:
        return

    # ── JSON formatter ────────────────────────────────────────────────────────
    formatter = MedTrustJsonFormatter(
        fmt="%(timestamp)s %(level)s %(service)s %(message)s",
        json_ensure_ascii=False,
    )

    # ── Stdout / stderr handler (Docker → log driver) ─────────────────────────
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(settings.log_level.upper())

    # ── Root logger ───────────────────────────────────────────────────────────
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.log_level.upper())
    root_logger.addHandler(stream_handler)

    # ── Loki handler (only when enabled in config) ────────────────────────────
    if settings.loki_enabled:
        loki_handler = LokiHttpHandler(
            loki_url=settings.loki_url,
            batch_size=settings.loki_batch_size,
            flush_interval=settings.loki_flush_interval,
        )
        loki_handler.setFormatter(formatter)
        loki_handler.setLevel(logging.WARNING)  # Ship WARNING+ to Loki
        root_logger.addHandler(loki_handler)

    # ── Suppress noisy third-party loggers ────────────────────────────────────
    for noisy_logger in (
        "uvicorn.access",
        "uvicorn.error",
        "sqlalchemy.engine",
        "httpx",
        "httpcore",
        "asyncio",
        "multipart",
    ):
        logging.getLogger(noisy_logger).setLevel(logging.WARNING)

    _configured = True


def get_logger(name: str) -> logging.Logger:
    """
    Return a named logger.  Configures the root logger on first call.

    Args:
        name: Typically ``__name__`` of the calling module.

    Returns:
        A standard ``logging.Logger`` instance backed by the JSON formatter
        and (optionally) the Loki HTTP handler.

    Example::

        from app.observability.logging import get_logger
        logger = get_logger(__name__)
        logger.info("Request received", extra={"endpoint": "/api/ai/predict-readmission"})
    """
    _configure_root_logger()
    return logging.getLogger(name)
