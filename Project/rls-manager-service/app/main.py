from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app

from app.config import settings
from app.observability.logging import setup_logging
from app.observability.tracing import setup_tracing
from app.auth.middleware import PQCAuthMiddleware
from app.auth.keycloak import refresh_jwks_task
from app.dependencies import get_redis_client

from app.routers import tenants, bypass, violations, migrations, websocket
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    setup_tracing(app)
    
    # Start JWKS background refresh
    jwks_task = asyncio.create_task(refresh_jwks_task())
    
    yield
    
    # Shutdown
    jwks_task.cancel()
    redis = get_redis_client()
    await redis.aclose()

app = FastAPI(
    title="MedTrustX RLS Manager Service",
    version=settings.service_version,
    lifespan=lifespan
)

app.add_middleware(PQCAuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Metrics endpoint
metrics_app = make_asgi_app()
app.mount(settings.prometheus_metrics_path, metrics_app)

app.include_router(tenants.router)
app.include_router(bypass.router)
app.include_router(violations.router)
app.include_router(migrations.router)
app.include_router(websocket.router)

@app.get("/health")
async def health():
    return {"status": "healthy"}
