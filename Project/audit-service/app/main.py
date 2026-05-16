"""
Audit Service Main Application.
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

from app.routers import events, integrity, breach, websocket

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    setup_tracing(app)
    
    jwks_task = asyncio.create_task(refresh_jwks_task())
    yield
    jwks_task.cancel()
    
    redis = get_redis_client()
    await redis.aclose()

app = FastAPI(
    title="MedTrustX Audit Service",
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

app.include_router(events.router)
app.include_router(integrity.router)
app.include_router(breach.router)
app.include_router(websocket.router)

@app.get("/health")
async def health():
    return {"status": "healthy"}
