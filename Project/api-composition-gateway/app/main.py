"""
API Composition Gateway Application.
"""
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.config import settings
from app.observability.logging import setup_logging
from app.observability.tracing import setup_tracing
from app.auth.middleware import TripleAuthMiddleware
from app.auth.keycloak import refresh_jwks_task, get_jwks
from app.services.service_registry import health_check_task
from prometheus_client import make_asgi_app

from app.routers import patient_dashboard, clinical_summary, admin_overview, discovery, websocket

setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_jwks()
    
    bg_tasks = [
        asyncio.create_task(refresh_jwks_task()),
        asyncio.create_task(health_check_task())
    ]
    
    yield
    
    for task in bg_tasks:
        task.cancel()

app = FastAPI(
    title="API Composition Gateway",
    version="1.0.0",
    lifespan=lifespan
)

setup_tracing(app)

app.add_middleware(TripleAuthMiddleware)

app.include_router(patient_dashboard.router)
app.include_router(clinical_summary.router)
app.include_router(admin_overview.router)
app.include_router(discovery.router)
app.include_router(websocket.router)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api-composition-gateway"}
