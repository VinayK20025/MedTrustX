"""
MedTrustX Devices & IoMT Service — Application Entrypoint
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

_LOG_LEVELS = {"debug": logging.DEBUG, "info": logging.INFO, "warning": logging.WARNING, "error": logging.ERROR}

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

REQUEST_COUNT = Counter(
    "device_service_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
)
REQUEST_LATENCY = Histogram(
    "device_service_request_duration_seconds",
    "Request latency in seconds",
    ["method", "endpoint"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5], # Tighter buckets for fast ingestion
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("service_starting", service=settings.SERVICE_NAME, version=settings.SERVICE_VERSION)
    await init_db()
    await init_producer()
    logger.info("service_ready", service=settings.SERVICE_NAME)
    yield
    await close_producer()
    await close_db()
    logger.info("service_stopped", service=settings.SERVICE_NAME)


app = FastAPI(
    title="MedTrustX Devices & IoMT Service",
    description="Secure medical device integration, registry, and high-frequency telemetry ingestion.",
    version=settings.SERVICE_VERSION,
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Tenant-ID", "X-Request-ID"],
)

app.add_middleware(TenantMiddleware)
app.add_middleware(ZTAMiddleware)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response: Response = await call_next(request)
    duration = time.perf_counter() - start

    path = request.url.path
    if "/devices" in path:
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

    response.headers["Server-Timing"] = f"total;dur={duration * 1000:.1f}"
    return response


from src.routes.health import router as health_router
from src.routes.devices import router as devices_router
from src.routes.assignments import router as assignments_router
from src.routes.telemetry import router as telemetry_router
from src.routes.alerts import router as alerts_router

app.include_router(health_router, tags=["Health"])
app.include_router(devices_router, prefix="/api/v1", tags=["Devices"])
app.include_router(assignments_router, prefix="/api/v1", tags=["Assignments"])
app.include_router(telemetry_router, prefix="/api/v1", tags=["Telemetry"])
app.include_router(alerts_router, prefix="/api/v1", tags=["Alerts"])


@app.get("/metrics", include_in_schema=False)
async def metrics():
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", path=request.url.path, method=request.method, error=str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "internal_server_error", "message": "An unexpected error occurred"},
    )
