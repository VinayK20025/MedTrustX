"""
app/main.py
============
FastAPI application factory for the MedTrustX AI Platform Service.

Startup sequence:
  1. Configure structured JSON logging.
  2. Initialise Prometheus service info metric.
  3. Start OpenTelemetry tracing (instruments FastAPI, SQLAlchemy, Redis, httpx).
  4. Start Keycloak JWKS background refresh task.
  5. Register PQCAuthMiddleware for JWT validation on all protected routes.
  6. Mount all API routers.
  7. Expose /health, /metrics, and /docs endpoints.

Shutdown sequence:
  1. Cancel JWKS refresh task.
  2. Flush and shut down OpenTelemetry tracer provider.
  3. Dispose SQLAlchemy connection pool.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import make_asgi_app

from app.auth.keycloak import start_jwks_background_refresh, stop_jwks_background_refresh
from app.auth.middleware import PQCAuthMiddleware
from app.config import settings
from app.db.session import dispose_engine
from app.observability.logging import get_logger
from app.observability.metrics import initialise_service_info
from app.observability.tracing import setup_tracing, shutdown_tracing
from app.routers import analytics, governance, inference, websocket

logger = get_logger(__name__)


# ─── Lifespan context manager ──────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    FastAPI lifespan handler — manages startup and shutdown tasks.

    All initialisation happens before ``yield``; all cleanup after.
    """
    # ── STARTUP ────────────────────────────────────────────────────────────
    logger.info(
        "MedTrustX AI Platform Service starting",
        extra={
            "version": settings.service_version,
            "environment": settings.environment,
            "port": settings.service_port,
        },
    )

    # Prometheus service info
    initialise_service_info(
        service_name=settings.service_name,
        version=settings.service_version,
        environment=settings.environment,
    )

    # OpenTelemetry tracing (must be done before first request)
    setup_tracing(app)

    # Keycloak JWKS — initial fetch + background refresh task
    try:
        await start_jwks_background_refresh()
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "JWKS initial fetch failed — service will retry in background",
            extra={"error": str(exc)},
        )

    logger.info("MedTrustX AI Platform Service ready to accept requests")

    yield  # ←── Application is running here

    # ── SHUTDOWN ───────────────────────────────────────────────────────────
    logger.info("MedTrustX AI Platform Service shutting down")

    await stop_jwks_background_refresh()
    shutdown_tracing()
    await dispose_engine()

    logger.info("MedTrustX AI Platform Service shutdown complete")


# ─── Application factory ───────────────────────────────────────────────────────

def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Separated from module-level instantiation so tests can call this
    function with different configurations.
    """
    app = FastAPI(
        title="MedTrustX AI Platform Service",
        description=(
            "Production-grade ML inference and analytics engine for the "
            "MedTrustX Digital Hospital Operating System (DHOS). "
            "Provides readmission risk prediction, vitals anomaly detection, "
            "diagnostic risk assessment, population analytics, and AI governance."
        ),
        version=settings.service_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
        # OpenAPI 3.1 metadata
        contact={
            "name": "MedTrustX ML Platform Team",
            "email": "ml-platform@medtrustx.hospital",
        },
        license_info={
            "name": "Proprietary",
            "url": "https://medtrustx.hospital/license",
        },
        servers=[
            {"url": "http://localhost:8010", "description": "Development"},
            {"url": "https://api.medtrustx.hospital", "description": "Production"},
        ],
    )

    # ── CORS middleware ────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            settings.pqc_session_header,
            "X-Request-ID",
            "X-Tenant-ID",
        ],
    )

    # ── PQC + JWT auth middleware ──────────────────────────────────────────
    # Must be added AFTER CORS so OPTIONS preflight requests pass through.
    app.add_middleware(PQCAuthMiddleware)

    # ── API routers ────────────────────────────────────────────────────────
    app.include_router(inference.router)
    app.include_router(analytics.router)
    app.include_router(governance.router)
    app.include_router(websocket.router)

    # ── Prometheus /metrics endpoint ───────────────────────────────────────
    # Mounted as a sub-application so it bypasses the auth middleware.
    metrics_app = make_asgi_app()
    app.mount("/metrics", metrics_app)

    # ── Health check endpoint ──────────────────────────────────────────────
    @app.get(
        "/health",
        tags=["Health"],
        summary="Service health check",
        description="Returns 200 when the service is healthy. Used by Docker health checks.",
        include_in_schema=True,
    )
    async def health_check(request: Request) -> JSONResponse:
        from app.db.session import _get_engine
        from app.auth.keycloak import _jwks_cache

        # Quick DB connectivity probe
        db_ok = False
        try:
            engine = _get_engine()
            async with engine.connect() as conn:
                await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
            db_ok = True
        except Exception:  # noqa: BLE001
            db_ok = False

        # JWKS cache populated?
        jwks_ok = len(_jwks_cache) > 0

        healthy = db_ok  # DB is the critical dependency
        return JSONResponse(
            status_code=200 if healthy else 503,
            content={
                "status": "healthy" if healthy else "degraded",
                "service": settings.service_name,
                "version": settings.service_version,
                "environment": settings.environment,
                "checks": {
                    "database": "ok" if db_ok else "error",
                    "jwks_cache": "ok" if jwks_ok else "empty",
                },
            },
        )

    # ── Root redirect ──────────────────────────────────────────────────────
    @app.get("/", include_in_schema=False)
    async def root() -> JSONResponse:
        return JSONResponse(
            content={
                "service": settings.service_name,
                "version": settings.service_version,
                "docs": "/docs",
                "health": "/health",
                "metrics": "/metrics",
            }
        )

    return app


# ─── Application instance (imported by uvicorn) ───────────────────────────────
app: FastAPI = create_app()
