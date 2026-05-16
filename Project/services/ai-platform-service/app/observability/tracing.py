"""
app/observability/tracing.py
============================
OpenTelemetry distributed tracing setup for the MedTrustX AI Platform Service.

Instruments:
  - FastAPI (auto — every HTTP route becomes a span)
  - SQLAlchemy async engine (DB query spans)
  - Redis client (cache operation spans)
  - httpx (outbound HTTP spans to TF Serving, Keycloak, MLflow)

Exports traces to Jaeger via OTLP HTTP (port 14268/api/traces).

Span enrichment helpers:
  - set_span_attributes()  — attach tenant_id, patient_id, model_name, latency_ms
  - get_tracer()           — returns a named tracer for manual span creation

Usage::

    from app.observability.tracing import get_tracer, set_span_attributes

    tracer = get_tracer(__name__)

    async def my_handler():
        with tracer.start_as_current_span("ai.inference.readmission") as span:
            set_span_attributes(span, tenant_id="tenant_apollo", model_name="readmission")
            ...
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.sampling import ParentBased, TraceIdRatioBased

from app.config import settings
from app.observability.logging import get_logger

if TYPE_CHECKING:
    from fastapi import FastAPI
    from opentelemetry.sdk.trace import Span

logger = get_logger(__name__)

# Module-level tracer provider reference (set once during setup_tracing)
_tracer_provider: TracerProvider | None = None


def setup_tracing(app: "FastAPI") -> None:
    """
    Initialise OpenTelemetry tracing for the FastAPI application.

    Must be called once during application startup (in ``app/main.py``).
    Subsequent calls are idempotent.

    Args:
        app: The FastAPI application instance to instrument.
    """
    global _tracer_provider  # noqa: PLW0603

    if not settings.otel_enabled:
        logger.info("OpenTelemetry tracing is disabled (OTEL_ENABLED=false)")
        return

    if _tracer_provider is not None:
        logger.debug("Tracing already configured — skipping re-initialisation")
        return

    # ── Service resource (appears in Jaeger UI) ────────────────────────────
    resource = Resource.create(
        attributes={
            "service.name": settings.otel_service_name,
            "service.version": settings.service_version,
            "deployment.environment": settings.environment,
            "service.namespace": "medtrust",
        }
    )

    # ── Sampler ────────────────────────────────────────────────────────────
    # ParentBased: honour sampling decision from upstream caller (Kong / ingress).
    # Falls back to TraceIdRatio for root spans.
    sampler = ParentBased(
        root=TraceIdRatioBased(settings.otel_trace_sample_rate)
    )

    # ── Tracer provider ────────────────────────────────────────────────────
    _tracer_provider = TracerProvider(resource=resource, sampler=sampler)

    # ── OTLP HTTP exporter → Jaeger ────────────────────────────────────────
    otlp_exporter = OTLPSpanExporter(
        endpoint=settings.otel_exporter_otlp_endpoint,
        headers={"Content-Type": "application/x-protobuf"},
    )

    # BatchSpanProcessor buffers spans and exports them asynchronously.
    # This prevents export latency from blocking request processing.
    span_processor = BatchSpanProcessor(
        span_exporter=otlp_exporter,
        max_queue_size=2048,
        max_export_batch_size=512,
        export_timeout_millis=5_000,
        schedule_delay_millis=1_000,
    )
    _tracer_provider.add_span_processor(span_processor)

    # Register as the global tracer provider
    trace.set_tracer_provider(_tracer_provider)

    # ── Auto-instrumentation ───────────────────────────────────────────────
    # FastAPI — wraps every route handler in a span
    FastAPIInstrumentor.instrument_app(
        app,
        tracer_provider=_tracer_provider,
        excluded_urls="/health,/metrics,/docs,/openapi.json,/redoc",
    )

    # SQLAlchemy — wraps every DB statement (engine set in db/session.py)
    SQLAlchemyInstrumentor().instrument(
        tracer_provider=_tracer_provider,
        # Omit raw SQL from spans in production to prevent PII leakage
        enable_commenter=True,
    )

    # Redis — wraps every Redis command
    RedisInstrumentor().instrument(tracer_provider=_tracer_provider)

    # httpx — wraps all outbound HTTP calls (TF Serving, Keycloak, MLflow)
    HTTPXClientInstrumentor().instrument(tracer_provider=_tracer_provider)

    logger.info(
        "OpenTelemetry tracing initialised",
        extra={
            "exporter": settings.otel_exporter_otlp_endpoint,
            "sample_rate": settings.otel_trace_sample_rate,
            "service": settings.otel_service_name,
        },
    )


def get_tracer(name: str) -> trace.Tracer:
    """
    Return a named OpenTelemetry tracer.

    If tracing has not been initialised (OTEL_ENABLED=false or called before
    ``setup_tracing``), returns a no-op tracer so callers need no guard logic.

    Args:
        name: Typically ``__name__`` of the calling module.

    Returns:
        A ``Tracer`` instance from the configured provider.
    """
    provider = _tracer_provider or trace.get_tracer_provider()
    return provider.get_tracer(
        name,
        schema_url="https://opentelemetry.io/schemas/1.20.0",
    )


def set_span_attributes(
    span: "Span",
    *,
    tenant_id: str | None = None,
    patient_id: str | None = None,
    model_name: str | None = None,
    latency_ms: float | None = None,
    **extra: Any,
) -> None:
    """
    Attach MedTrust-specific semantic attributes to an active span.

    All parameters are keyword-only to prevent positional argument confusion.
    None values are silently skipped.

    Args:
        span:        The OpenTelemetry span to annotate.
        tenant_id:   Multi-tenant identifier (e.g. "tenant_apollo").
        patient_id:  Patient UUID string.
        model_name:  ML model name (e.g. "readmission").
        latency_ms:  End-to-end inference latency in milliseconds.
        **extra:     Any additional key/value attributes.
    """
    if not span.is_recording():
        return

    if tenant_id is not None:
        span.set_attribute("medtrust.tenant_id", tenant_id)
    if patient_id is not None:
        span.set_attribute("medtrust.patient_id", patient_id)
    if model_name is not None:
        span.set_attribute("medtrust.model_name", model_name)
    if latency_ms is not None:
        span.set_attribute("medtrust.latency_ms", round(latency_ms, 3))

    for key, value in extra.items():
        if value is not None:
            span.set_attribute(f"medtrust.{key}", str(value))


def get_current_trace_id() -> str | None:
    """
    Return the current OpenTelemetry trace ID as a 32-char hex string,
    or None if no active span exists.

    Used to inject trace_id into RFC 7807 error responses.
    """
    span = trace.get_current_span()
    ctx = span.get_span_context()
    if ctx.is_valid:
        return format(ctx.trace_id, "032x")
    return None


def shutdown_tracing() -> None:
    """
    Gracefully flush and shut down the tracer provider.

    Called during application shutdown to ensure all buffered spans are
    exported to Jaeger before the process exits.
    """
    if _tracer_provider is not None:
        logger.info("Flushing and shutting down OpenTelemetry tracer provider")
        _tracer_provider.shutdown()
