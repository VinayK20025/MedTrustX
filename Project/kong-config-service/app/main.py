"""
Kong Config Service Application.
"""
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.config import settings
from app.observability.logging import setup_logging
from app.observability.tracing import setup_tracing
from app.auth.middleware import PQCAuthMiddleware
from app.auth.keycloak import refresh_jwks_task, get_jwks
from app.services.threat_intelligence import threat_scanner_task
from app.db.session import session_maker
from prometheus_client import make_asgi_app

from app.routers import routes, plugins, threats, analytics, websocket

setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_jwks()
    
    bg_tasks = [
        asyncio.create_task(refresh_jwks_task()),
        asyncio.create_task(threat_scanner_task(session_maker))
    ]
    
    yield
    
    for task in bg_tasks:
        task.cancel()

app = FastAPI(
    title="Kong Config Service",
    version="1.0.0",
    lifespan=lifespan
)

setup_tracing(app)

app.add_middleware(PQCAuthMiddleware)

app.include_router(routes.router)
app.include_router(plugins.router)
app.include_router(threats.router)
app.include_router(analytics.router)
app.include_router(websocket.router)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "kong-config-service"}
