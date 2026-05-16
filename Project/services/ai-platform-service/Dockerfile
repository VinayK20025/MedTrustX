# =============================================================================
# MedTrustX AI Platform Service — Dockerfile
# =============================================================================
# Multi-stage build:
#   Stage 1 (builder) — compiles liboqs from source for Kyber-768 PQC support
#                        and installs all Python wheels into a venv.
#   Stage 2 (runtime) — copies only the venv + app code; runs as non-root.
#
# Base image: python:3.11-slim-bookworm (Debian 12, minimal footprint)
# Final image size target: < 1.2 GB (including ML libs)
# =============================================================================

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 1 — builder
# Installs build tools, compiles liboqs + liboqs-python, builds all wheels.
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim-bookworm AS builder

# Prevent Python from writing .pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # pip tuning
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=120 \
    # Build output directory for the virtual environment
    VENV_PATH=/opt/venv

# ── System build dependencies ──────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    # liboqs compile-time deps
    build-essential \
    cmake \
    ninja-build \
    libssl-dev \
    # asyncpg / cryptography native extensions
    libpq-dev \
    gcc \
    g++ \
    # git needed to clone liboqs
    git \
    # curl for health-check script
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Create and activate a virtual environment ─────────────────────────────
RUN python -m venv ${VENV_PATH}
ENV PATH="${VENV_PATH}/bin:${PATH}"

# Upgrade pip + build tools inside the venv
RUN pip install --upgrade pip setuptools wheel

# ── Build liboqs (Open Quantum Safe C library) from source ────────────────
# liboqs must be compiled first so liboqs-python can link against it.
ARG LIBOQS_VERSION=0.10.0
WORKDIR /build/liboqs

RUN git clone --depth 1 --branch ${LIBOQS_VERSION} \
    https://github.com/open-quantum-safe/liboqs.git . \
    && cmake -GNinja \
        -DCMAKE_INSTALL_PREFIX=/usr/local \
        -DBUILD_SHARED_LIBS=ON \
        -DOQS_BUILD_ONLY_LIB=ON \
        -DOQS_USE_OPENSSL=ON \
        -DOQS_DIST_BUILD=ON \
        . \
    && ninja \
    && ninja install \
    && ldconfig

# ── Build liboqs-python (Python bindings for liboqs) ─────────────────────
ARG LIBOQS_PYTHON_VERSION=0.10.0
WORKDIR /build/liboqs-python

RUN git clone --depth 1 --branch ${LIBOQS_PYTHON_VERSION} \
    https://github.com/open-quantum-safe/liboqs-python.git . \
    && pip install .

# ── Install remaining Python dependencies ────────────────────────────────
COPY requirements.txt /tmp/requirements.txt

# Remove liboqs-python from requirements.txt for pip (already installed above)
# and install the rest in one layer for cache efficiency.
RUN grep -v "^liboqs-python" /tmp/requirements.txt > /tmp/reqs_filtered.txt \
    && pip install --no-cache-dir -r /tmp/reqs_filtered.txt

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 2 — runtime
# Lean final image: copies venv, liboqs shared lib, and app source only.
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VENV_PATH=/opt/venv \
    # Make venv the default Python environment
    PATH="/opt/venv/bin:${PATH}" \
    # Ensure liboqs shared library is discoverable at runtime
    LD_LIBRARY_PATH="/usr/local/lib:${LD_LIBRARY_PATH}" \
    # Default service config (overridden by docker-compose env vars)
    SERVICE_PORT=8010 \
    ENVIRONMENT=production \
    LOG_LEVEL=info

# ── Runtime system libraries only ─────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    # libssl needed by liboqs at runtime
    libssl3 \
    # libpq needed by asyncpg at runtime
    libpq5 \
    # curl for the Docker health-check
    curl \
    # ca-certificates for HTTPS calls to Keycloak / TF Serving
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ── Copy liboqs shared library from builder ───────────────────────────────
COPY --from=builder /usr/local/lib/liboqs.so* /usr/local/lib/
COPY --from=builder /usr/local/include/oqs   /usr/local/include/oqs
RUN ldconfig

# ── Copy Python virtual environment from builder ──────────────────────────
COPY --from=builder ${VENV_PATH} ${VENV_PATH}

# ── Create non-root service user ──────────────────────────────────────────
RUN groupadd --gid 10001 appgroup \
    && useradd --uid 10001 --gid 10001 --no-create-home --shell /sbin/nologin appuser

# ── Application working directory ─────────────────────────────────────────
WORKDIR /app

# ── Copy application source ───────────────────────────────────────────────
COPY --chown=appuser:appgroup app/ ./app/

# ── PQC key secrets directory (mounted at runtime from Vault / k8s secret) ─
RUN mkdir -p /run/secrets && chown appuser:appgroup /run/secrets

# ── Drop to non-root user ─────────────────────────────────────────────────
USER appuser

# ── Expose service port ────────────────────────────────────────────────────
EXPOSE 8010

# ── Health check ──────────────────────────────────────────────────────────
# Docker polls this every 15s; 3 consecutive failures → container unhealthy.
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl --silent --fail http://localhost:${SERVICE_PORT}/health || exit 1

# ── Entrypoint ────────────────────────────────────────────────────────────
# uvicorn is launched with:
#   --workers 1  → single worker (use Kubernetes HPA for horizontal scaling)
#   --loop  uvloop  → fastest async event loop
#   --http  httptools → fastest HTTP parser
#   --proxy-headers → trust X-Forwarded-* from Kong gateway
#   --forwarded-allow-ips → allow all (Kong is the TLS terminator)
CMD ["uvicorn", "app.main:app", \
    "--host", "0.0.0.0", \
    "--port", "8010", \
    "--workers", "1", \
    "--loop", "uvloop", \
    "--http", "httptools", \
    "--proxy-headers", \
    "--forwarded-allow-ips", "*", \
    "--log-level", "warning"]
