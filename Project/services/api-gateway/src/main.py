"""
MedTrustX Internal API Gateway — Application Entrypoint
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
    "gateway_requests_total",
    "Total HTTP requests handled by gateway",
    ["method", "endpoint", "status"],
)
REQUEST_LATENCY = Histogram(
    "gateway_request_duration_seconds",
    "Request latency in seconds",
    ["method", "endpoint"],
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("gateway_starting", service=settings.SERVICE_NAME, version=settings.SERVICE_VERSION)
    await init_db()
    await init_producer()
    logger.info("gateway_ready", service=settings.SERVICE_NAME)
    yield
    await close_producer()
    from src.services.proxy_service import client
    await client.aclose()
    await close_db()
    logger.info("gateway_stopped", service=settings.SERVICE_NAME)


app = FastAPI(
    title="MedTrustX Internal API Gateway",
    description="Central routing, policy enforcement, and request mediation layer.",
    version=settings.SERVICE_VERSION,
    docs_url="/api/v1/gateway/docs",
    redoc_url="/api/v1/gateway/redoc",
    openapi_url="/api/v1/gateway/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Tenant-ID", "X-Request-ID", "X-Gateway-Request-Id"],
)

app.add_middleware(TenantMiddleware)
app.add_middleware(ZTAMiddleware)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response: Response = await call_next(request)
    duration = time.perf_counter() - start

    path = request.url.path
    if "/routes" in path or "/policies" in path:
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
    else:
        # Prevent cardinality explosion for raw proxied requests by grouping
        base = path.split("/")[1] if len(path.split("/")) > 1 else "unknown"
        path = f"/{base}/*"

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
from src.routes.management import router as management_router
from src.routes.proxy import router as proxy_router

app.include_router(health_router, tags=["Health"])
# Management API uses a specific prefix to avoid colliding with proxy targets
app.include_router(management_router, prefix="/api/v1")
# Proxy router must be added last so it acts as a catch-all
app.include_router(proxy_router)


@app.get("/metrics", include_in_schema=False)
async def metrics():
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_gateway_exception", path=request.url.path, method=request.method, error=str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "gateway_error", "message": "The API Gateway encountered an unexpected error"},
    )
