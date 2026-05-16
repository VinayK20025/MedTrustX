"""
GraphQL Federation Gateway.
"""
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.config import settings
from app.observability.logging import setup_logging
from app.observability.tracing import setup_tracing
from app.auth.middleware import GraphQLAuthMiddleware
from app.auth.keycloak import refresh_jwks_task, get_jwks
from app.routers.graphql import graphql_app
from prometheus_client import make_asgi_app

setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_jwks()
    
    bg_tasks = [
        asyncio.create_task(refresh_jwks_task())
    ]
    
    yield
    
    for task in bg_tasks:
        task.cancel()

app = FastAPI(
    title="GraphQL Federation Gateway",
    version="1.0.0",
    lifespan=lifespan
)

setup_tracing(app)

app.add_middleware(GraphQLAuthMiddleware)

app.include_router(graphql_app, prefix="/graphql")

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "graphql-federation-gateway"}
