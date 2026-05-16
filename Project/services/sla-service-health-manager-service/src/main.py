"""
MedTrustX SLA & Service Health Manager Service — Application Entrypoint
"""
import time, logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import structlog
from src.config import settings
from src.database import close_db, init_db
from src.middleware.tenant import TenantMiddleware
from src.middleware.zta import ZTAMiddleware
from src.services.event_publisher import close_producer, init_producer

_LOG_LEVELS = {"debug": logging.DEBUG, "info": logging.INFO, "warning": logging.WARNING, "error": logging.ERROR}
structlog.configure(processors=[structlog.contextvars.merge_contextvars, structlog.processors.add_log_level, structlog.processors.TimeStamper(fmt="iso"), structlog.processors.StackInfoRenderer(), structlog.processors.format_exc_info, structlog.processors.JSONRenderer()], wrapper_class=structlog.make_filtering_bound_logger(_LOG_LEVELS.get(settings.LOG_LEVEL.lower(), logging.DEBUG)), context_class=dict, logger_factory=structlog.PrintLoggerFactory(), cache_logger_on_first_use=True)
logger = structlog.get_logger()

REQUEST_COUNT = Counter("sla_health_requests_total", "Total HTTP requests", ["method", "endpoint", "status"])
REQUEST_LATENCY = Histogram("sla_health_request_duration_seconds", "Request latency", ["method", "endpoint"])

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

app = FastAPI(title="MedTrustX SLA & Service Health Manager Service", description="Tier-0 system reliability tracking layer.", version=settings.SERVICE_VERSION, docs_url="/docs", redoc_url="/redoc", openapi_url="/openapi.json", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"] if settings.ENVIRONMENT == "development" else [], allow_credentials=True, allow_methods=["*"], allow_headers=["*"], expose_headers=["X-Tenant-ID", "X-Request-ID"])
app.add_middleware(TenantMiddleware)
app.add_middleware(ZTAMiddleware)

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response: Response = await call_next(request)
    duration = time.perf_counter() - start
    path = request.url.path
    if path.startswith("/slas/") and len(path.split("/")) > 2:
        parts = path.split("/")
        parts[2] = "{id}"
        path = "/".join(parts)
    elif path.startswith("/health/") and len(path.split("/")) > 2:
        parts = path.split("/")
        parts[2] = "{service_name}"
        path = "/".join(parts)
    REQUEST_COUNT.labels(method=request.method, endpoint=path, status=response.status_code).inc()
    REQUEST_LATENCY.labels(method=request.method, endpoint=path).observe(duration)
    response.headers["Server-Timing"] = f"total;dur={duration * 1000:.1f}"
    return response

from src.routes.health import router as health_router
from src.routes.sla import router as sla_router
app.include_router(health_router, tags=["Health"])
app.include_router(sla_router)

@app.get("/metrics", include_in_schema=False)
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", path=request.url.path, method=request.method, error=str(exc), exc_info=True)
    return JSONResponse(status_code=500, content={"error": "internal_server_error", "message": "An unexpected error occurred", "service": settings.SERVICE_NAME})
