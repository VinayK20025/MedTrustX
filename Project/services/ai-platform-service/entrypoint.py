#!/usr/bin/env python3
"""
entrypoint.py
=============
Uvicorn production entrypoint for the MedTrustX AI Platform Service.

Runs with:
  - uvloop event loop for maximum async throughput
  - Single worker (horizontal scaling via Kubernetes HPA)
  - Access log disabled (structured logging via app middleware instead)
  - Graceful shutdown timeout of 30 seconds
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.service_port,
        loop="uvloop",
        workers=1,
        access_log=False,
        log_config=None,          # Disable uvicorn's default logger; app configures its own
        proxy_headers=True,       # Trust X-Forwarded-For from Kong ingress
        forwarded_allow_ips="*",  # All upstream IPs trusted (Kong validates)
        timeout_graceful_shutdown=30,
        server_header=False,       # Don't expose uvicorn version in response headers
        date_header=False,
    )
