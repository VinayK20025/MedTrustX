"""
Compliance Service Main Application.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
import asyncio

from app.config import settings
from app.observability.logging import setup_logging
from app.observability.tracing import setup_tracing
from app.auth.middleware import PQCAuthMiddleware
from app.auth.keycloak import refresh_jwks_task
from app.dependencies import get_redis_client
from app.scheduler import start_scheduler, stop_scheduler

from app.routers import controls, gaps, risks, reports, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    setup_tracing(app)
    
    jwks_task = asyncio.create_task(refresh_jwks_task())
    await start_scheduler()
    
    yield
    
    jwks_task.cancel()
    await stop_scheduler()
    
    redis = get_redis_client()
    await redis.aclose()

app = FastAPI(
    title="MedTrustX Compliance Service",
    lifespan=lifespan
)

app.add_middleware(PQCAuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

app.include_router(controls.router)
app.include_router(gaps.router)
app.include_router(risks.router)
app.include_router(reports.router)
app.include_router(dashboard.router)

@app.get("/health")
async def health():
    return {"status": "healthy"}
