#!/bin/bash

# MedTrustX — Robust Production Startup Script
# Strategy:
#   1. Start ONLY infrastructure via docker-compose.infra.yml (Postgres, Redis, OPA)
#   2. Initialize databases
#   3. Start IAM Service natively (Python/uvicorn on port 5001)
#   4. Start Gateway Service natively (NestJS on port 4001)
#   5. Start all 139+ Python microservices via run_backends.py
#   6. Start Next.js frontend on 0.0.0.0:3000

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "=========================================================="
echo "  Starting MedTrustX ZTA Complete Production Environment"
echo "=========================================================="

# ── Cleanup handler ──────────────────────────────────────────────
function cleanup {
  echo ""
  echo "Shutting down all production services..."
  # Kill all background jobs spawned by this script
  kill $(jobs -p) 2>/dev/null || true
  # Tear down infra containers
  docker compose -f docker-compose.infra.yml down 2>/dev/null || true
  echo "MedTrustX gracefully shut down."
  exit 0
}
trap cleanup EXIT INT TERM

# ── [1/5] Infrastructure ─────────────────────────────────────────
echo ""
echo "[1/5] Starting Zero Trust Infrastructure (Postgres, Redis, OPA)..."
docker compose -f docker-compose.infra.yml up -d

echo "Waiting for PostgreSQL and Redis to be healthy..."
until docker exec medtrust-pg-iam pg_isready -U medtrust_iam_admin -d iam_db 2>/dev/null; do
  echo "  ... waiting for pg-iam"
  sleep 3
done
until docker exec medtrust-redis redis-cli -a redis_secret_2026 ping 2>/dev/null | grep -q PONG; do
  echo "  ... waiting for redis"
  sleep 2
done
echo "  ✓ Infrastructure is healthy."

# ── [2/5] Database Orchestration ────────────────────────────────
echo ""
echo "[2/5] Initializing Database Architectures..."
python3 init_dbs.py 2>&1 | tail -5
echo "  ✓ Databases initialized."
sleep 2

# ── [3/5] IAM Service (Python — Port 5001) ───────────────────────
echo ""
echo "[3/5] Starting IAM Service (Auth)..."
cd "$PROJECT_DIR/services/iam-service"
if [ ! -d ".venv" ] && [ ! -f "requirements.txt" ]; then
  echo "  [WARN] IAM service not found — skipping."
else
  export DATABASE_URL="postgresql+asyncpg://medtrust_iam_admin:iam_db_secret_2026@localhost:5434/iam_db"
  export JWT_SECRET="medtrust-dev-jwt-secret-change-in-production-2026"
  export REDIS_URL="redis://:redis_secret_2026@localhost:6379/0"
  export OPA_URL="http://localhost:8181"
  export ENVIRONMENT="development"
  export NODE_ENV="development"
  python3 -m uvicorn src.main:app --host 0.0.0.0 --port 5001 --log-level warning > "$PROJECT_DIR/iam.log" 2>&1 &
  echo "  ✓ IAM Service starting on port 5001..."
  sleep 5
fi
cd "$PROJECT_DIR"

# ── [4/5] Gateway + Python Backends ──────────────────────────────
echo ""
echo "[4/5] Starting ALL 139+ ZTA Microservices & AI/UEBA Engines..."

# Gateway (NestJS)
cd "$PROJECT_DIR/services/gateway-service"
if [ ! -d "node_modules" ]; then
  npm install --silent
fi
export JWT_SECRET="medtrust-dev-jwt-secret-change-in-production-2026"
export OPA_URL="http://localhost:8181"
export NODE_ENV="development"
npm run start:dev > "$PROJECT_DIR/gateway.log" 2>&1 &
cd "$PROJECT_DIR"
echo "  ✓ Gateway Service starting on port 4001..."

# Python microservices
python3 run_backends.py --max 150 > "$PROJECT_DIR/backends_full.log" 2>&1 &
echo "  ✓ Backend services launching in background (see backends_full.log)..."
echo "  Waiting 25 seconds for services to initialize..."
sleep 25

# ── [5/5] Frontend ────────────────────────────────────────────────
echo ""
echo "[5/5] Starting Universal Frontend UI on 0.0.0.0:3000..."
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo "  Installing frontend dependencies..."
  npm install --silent
fi
npm run dev > "$PROJECT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd "$PROJECT_DIR"

echo "  Waiting for frontend to compile..."
WAIT=0
until curl -s http://localhost:3000 > /dev/null 2>&1; do
  sleep 3
  WAIT=$((WAIT+3))
  if [ $WAIT -ge 90 ]; then
    echo "  [WARN] Frontend is taking longer than expected — check frontend.log"
    break
  fi
done

echo ""
echo "=========================================================="
echo "  FULL PLATFORM ONLINE - READY FOR TESTING"
echo "=========================================================="
echo "  Universal Dashboard:    http://143.244.137.224:3000"
echo "  ZTA API Gateway:        http://143.244.137.224:4001"
echo "  IAM Service Auth:       http://localhost:5001"
echo ""
echo "  Testing Credentials:"
echo "  1. CEO/Super Admin: demo@chief-executive-officer.local.medtrustx"
echo "     Password:        Chief_Executive_Officer@1Demo"
echo ""
echo "  2. CISO/Security:   demo@chief-information-security-officer.local.medtrustx"
echo "     Password:        Chief_Information_Security_Officer@1Demo"
echo ""
echo "  3. Triage Nurse:    demo@triage-nurse.local.medtrustx"
echo "     Password:        Triage_Nurse@1Demo"
echo ""
echo "  Logs:"
echo "    Frontend:  tail -f $PROJECT_DIR/frontend.log"
echo "    IAM:       tail -f $PROJECT_DIR/iam.log"
echo "    Gateway:   tail -f $PROJECT_DIR/gateway.log"
echo "    Backends:  tail -f $PROJECT_DIR/backends_full.log"
echo "=========================================================="
echo "Press Ctrl+C to stop all services."

wait
