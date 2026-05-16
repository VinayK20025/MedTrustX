"""MedTrustX analytics-service - FastAPI Application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="MedTrustX analytics-service",
    description="MedTrustX DHOS - analytics-service microservice",
    version="1.0.0",
    docs_url="/api/v1/docs",
    openapi_url="/api/v1/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
@app.get("/api/v1/health")
async def health():
    return {"status": "healthy", "service": "analytics-service", "version": "1.0.0"}

@app.get("/api/v1/ready")
async def ready():
    return {"status": "ready", "service": "analytics-service"}