"""
MedTrustX DB Extraction Engine — Application Entrypoint

Sits between [Service DBs] → [Event Bus] → [Extraction Engine] → [Dashboard/Analytics]

Components:
  A. Query Orchestrator — complex multi-source queries
  B. Data Connectors — read-only access to service DB replicas
  C. Transformation Layer — raw data → actionable insights
  D. Aggregation Engine — counts, averages, trends
  E. Caching Layer — Redis for fast repeated queries
"""
import time, logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
import structlog

from src.config import settings
from src.middleware.tenant import TenantMiddleware
from src.middleware.zta import ZTAMiddleware
from src.connectors.service_connector import registry

_LOG_LEVELS = {"debug": logging.DEBUG, "info": logging.INFO, "warning": logging.WARNING, "error": logging.ERROR}
structlog.configure(
    processors=[structlog.contextvars.merge_contextvars, structlog.processors.add_log_level, structlog.processors.TimeStamper(fmt="iso"), structlog.processors.format_exc_info, structlog.processors.JSONRenderer()],
    wrapper_class=structlog.make_filtering_bound_logger(_LOG_LEVELS.get(settings.LOG_LEVEL.lower(), logging.DEBUG)),
    context_class=dict, logger_factory=structlog.PrintLoggerFactory(), cache_logger_on_first_use=True,
)
logger = structlog.get_logger()

# Local engine for derived tables
_local_engine = create_async_engine(settings.DATABASE_URL, pool_size=20, max_overflow=10, pool_pre_ping=True, pool_recycle=300)
_local_session_factory = async_sessionmaker(bind=_local_engine, class_=AsyncSession, expire_on_commit=False)

REQUEST_COUNT = Counter("extraction_requests_total", "Total HTTP requests", ["method", "endpoint", "status"])
REQUEST_LATENCY = Histogram("extraction_request_duration_seconds", "Request latency", ["method", "endpoint"])


@asynccontextmanager
async def get_local_session():
    async with _local_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("extraction_engine_starting", service=settings.SERVICE_NAME)
    # Create derived tables
    from src.models.derived_tables import ExtractionBase
    async with _local_engine.begin() as conn:
        await conn.run_sync(ExtractionBase.metadata.create_all)
    # Register upstream service connectors
    registry.register("patient-service", settings.PATIENT_DB_URL)
    registry.register("clinical-service", settings.CLINICAL_DB_URL)
    registry.register("icu-service", settings.ICU_DB_URL)
    registry.register("billing-service", settings.BILLING_DB_URL)
    registry.register("pharmacy-service", settings.PHARMACY_DB_URL)
    logger.info("extraction_engine_ready", connectors=5)
    yield
    await registry.close_all()
    await _local_engine.dispose()
    logger.info("extraction_engine_stopped")


app = FastAPI(
    title="MedTrustX DB Extraction Engine",
    description="Query orchestration, data aggregation, and derived insights across all service databases.",
    version=settings.SERVICE_VERSION, lifespan=lifespan,
)
app.add_middleware(CORSMiddleware, allow_origins=["*"] if settings.ENVIRONMENT == "development" else [], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(TenantMiddleware)
app.add_middleware(ZTAMiddleware)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response: Response = await call_next(request)
    duration = time.perf_counter() - start
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path, status=response.status_code).inc()
    REQUEST_LATENCY.labels(method=request.method, endpoint=request.url.path).observe(duration)
    response.headers["Server-Timing"] = f"total;dur={duration * 1000:.1f}"
    return response


from src.routes.health import router as health_router
from src.routes.extraction import router as extraction_router
app.include_router(health_router, tags=["Health"])
app.include_router(extraction_router)


@app.get("/metrics", include_in_schema=False)
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", path=request.url.path, error=str(exc), exc_info=True)
    return JSONResponse(status_code=500, content={"error": "internal_server_error", "service": settings.SERVICE_NAME})
