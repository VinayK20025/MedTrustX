"""
MedTrustX Emergency (ER) Service — Application Entrypoint

Tier-0 Life-Critical Service — manages the end-to-end emergency care workflow:
  - Patient triage and severity-based prioritization (ESI 1–5)
  - Emergency case registration and lifecycle management
  - Real-time priority queue with dynamic recalculation
  - Staff assignment and resource allocation
  - Immutable event timeline for audit trail

This is the FastAPI application bootstrap. It configures:
  - Lifespan events (DB init, Kafka producer)
  - CORS, tenant isolation, and ZTA middleware
  - All API routers (cases, triage, assignments, queue, events, health)
  - Prometheus metrics endpoint
  - Structured logging (structlog + JSON)
  - OpenAPI / Swagger documentation

Security: Full Zero Trust — JWT (Keycloak) + OPA policy enforcement +
tenant isolation (RLS) on every request.
"""
import time
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import (
    Counter,
    Histogram,
    generate_latest,
    CONTENT_TYPE_LATEST,
)
import structlog

from src.config import settings
from src.database import close_db, init_db
from src.middleware.tenant import TenantMiddleware
from src.middleware.zta import ZTAMiddleware
from src.services.event_publisher import close_producer, init_producer

# ── Structured Logging ──────────────────────────────────────────
_LOG_LEVELS = {
    "debug": logging.DEBUG,
    "info": logging.INFO,
    "warning": logging.WARNING,
    "error": logging.ERROR,
}

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        _LOG_LEVELS.get(settings.LOG_LEVEL.lower(), logging.DEBUG)
    ),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# ── Prometheus Metrics ──────────────────────────────────────────
REQUEST_COUNT = Counter(
    "er_service_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
)
REQUEST_LATENCY = Histogram(
    "er_service_request_duration_seconds",
    "Request latency in seconds",
    ["method", "endpoint"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)
ER_OPERATIONS = Counter(
    "er_service_operations_total",
    "ER domain operations",
    ["operation"],
)
ER_CASE_SEVERITY = Counter(
    "er_service_cases_by_severity",
    "Emergency cases by severity level",
    ["severity_level"],
)
ER_TRIAGE_SCORE = Histogram(
    "er_service_triage_priority_score",
    "Distribution of triage priority scores",
    [],
    buckets=[1, 2, 3, 4, 5],
)


# ── Lifespan (startup / shutdown) ──────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize and tear down resources."""
    logger.info(
        "service_starting",
        service=settings.SERVICE_NAME,
        version=settings.SERVICE_VERSION,
        environment=settings.ENVIRONMENT,
    )

    # Startup
    await init_db()
    await init_producer()
    logger.info("service_ready", service=settings.SERVICE_NAME)

    yield

    # Shutdown
    await close_producer()
    await close_db()
    logger.info("service_stopped", service=settings.SERVICE_NAME)


# ── FastAPI Application ────────────────────────────────────────
app = FastAPI(
    title="MedTrustX Emergency (ER) Service",
    description=(
        "**Tier-0 Life-Critical Service** — Manages the end-to-end emergency "
        "care workflow including patient triage, severity-based prioritization "
        "(ESI 1–5), real-time queue management, and staff resource allocation.\n\n"
        "**Domain Boundary**: Triage, emergency cases, priority queues, ER workflow "
        "state, and staff assignments ONLY. Patient identity, clinical documentation, "
        "bed allocation, and diagnostics are handled by their respective services.\n\n"
        "**Security**: Full Zero Trust — JWT (Keycloak) + OPA policy enforcement + "
        "tenant isolation (RLS) on every request.\n\n"
        "**Event-Driven**: Publishes ER_CASE_CREATED, TRIAGE_COMPLETED, "
        "ER_CASE_ASSIGNED, ER_CASE_ESCALATED, ER_CASE_CLOSED to Kafka for "
        "downstream consumers (ICU, notifications, analytics, command-center)."
    ),
    version=settings.SERVICE_VERSION,
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
    openapi_tags=[
        {
            "name": "Emergency Cases",
            "description": "Core emergency case CRUD, lifecycle management, and search",
        },
        {
            "name": "Triage",
            "description": "Clinical triage assessment with ESI priority scoring and vitals capture",
        },
        {
            "name": "Assignments",
            "description": "Staff (doctor/nurse/specialist) assignment to emergency cases",
        },
        {
            "name": "ER Queue",
            "description": "Real-time priority queue — patients ordered by severity and wait time",
        },
        {
            "name": "ER Events",
            "description": "Immutable case event timeline / audit trail",
        },
        {
            "name": "Health",
            "description": "Liveness and readiness probes",
        },
    ],
)

# ── CORS ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Tenant-ID", "X-Request-ID"],
)

# ── Middleware Stack (order matters: bottom runs first) ─────────
# 1. Tenant extraction → sets request.state.tenant_id
app.add_middleware(TenantMiddleware)
# 2. ZTA policy enforcement → calls OPA for authorization
app.add_middleware(ZTAMiddleware)


# ── Request Metrics Middleware ──────────────────────────────────
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """Track request count and latency for Prometheus."""
    start = time.perf_counter()
    response: Response = await call_next(request)
    duration = time.perf_counter() - start

    # Normalize path to avoid cardinality explosion
    path = request.url.path
    if "/er/" in path or "/cases/" in path:
        # Replace UUID segments with {id}
        parts = path.split("/")
        normalized = []
        for part in parts:
            try:
                if len(part) == 36 and part.count("-") == 4:
                    normalized.append("{id}")
                else:
                    normalized.append(part)
            except Exception:
                normalized.append(part)
        path = "/".join(normalized)

    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=path,
        status=response.status_code,
    ).inc()
    REQUEST_LATENCY.labels(
        method=request.method,
        endpoint=path,
    ).observe(duration)

    # Add server timing header
    response.headers["Server-Timing"] = f"total;dur={duration * 1000:.1f}"
    return response


# ── Register Routers ───────────────────────────────────────────
from src.routes.health import router as health_router
from src.routes.cases import router as cases_router
from src.routes.triage import router as triage_router
from src.routes.assignments import router as assignments_router
from src.routes.queue import router as queue_router
from src.routes.events import router as events_router

app.include_router(health_router, tags=["Health"])
app.include_router(cases_router, prefix="/api/v1", tags=["Emergency Cases"])
app.include_router(triage_router, prefix="/api/v1", tags=["Triage"])
app.include_router(assignments_router, prefix="/api/v1", tags=["Assignments"])
app.include_router(queue_router, prefix="/api/v1", tags=["ER Queue"])
app.include_router(events_router, prefix="/api/v1", tags=["ER Events"])


# ── Prometheus Metrics Endpoint ────────────────────────────────
@app.get("/metrics", include_in_schema=False)
async def metrics():
    """Prometheus scrape endpoint."""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )


# ── Global Exception Handler ──────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions — log and return 500."""
    logger.error(
        "unhandled_exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An unexpected error occurred",
            "service": settings.SERVICE_NAME,
        },
    )
