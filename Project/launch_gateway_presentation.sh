#!/bin/bash
# launch_gateway_presentation.sh
# Launches only the API Gateway modules and required core services for the MedTrustX presentation.
# Assumes infrastructure (Redis, Postgres, Keycloak, OPA, Kong) is already up or starts them.

set -e

echo "===================================================="
echo "🚀 MedTrustX API Gateway Presentation Launcher"
echo "===================================================="

echo ""
echo "[1/4] Ensuring Docker networks exist..."
docker network create medtrust-edge     2>/dev/null || true
docker network create medtrust-gateway  2>/dev/null || true
docker network create medtrust-services 2>/dev/null || true
docker network create medtrust-data     2>/dev/null || true
docker network create medtrust-security 2>/dev/null || true
docker network create medtrust-monitoring 2>/dev/null || true
docker network create medtrust-integration 2>/dev/null || true
echo "✅ Networks ready"

echo ""
echo "[2/4] Starting Core Infrastructure (Redis, Postgres, OPA)..."
docker compose -f docker-compose.infra.yml up -d redis pg-operational pg-iam pg-clinical opa
echo "⏳ Waiting 8s for infra to initialize..."
sleep 8
echo "✅ Infrastructure ready"

echo ""
echo "[3/4] Starting Core Microservices + Kong Edge..."
docker compose up -d \
  kong \
  keycloak \
  patient-service \
  clinical-service \
  appointment-service \
  ai-service \
  audit-service \
  compliance-service \
  zta-service \
  iam-service
echo "⏳ Waiting 12s for services to be healthy..."
sleep 12
echo "✅ Microservices ready"

echo ""
echo "[4/4] Building & starting API Gateway services..."
docker compose -f docker-compose.gateway.yml up -d --build
echo "⏳ Waiting 10s for gateway services to build and start..."
sleep 10
echo "✅ Gateway services ready"

echo ""
echo "[5/5] Starting Frontend..."
docker compose up -d frontend
echo "⏳ Waiting 5s for frontend..."
sleep 5

echo ""
echo "===================================================="
echo "✅  Environment is LIVE!"
echo "===================================================="
echo ""
echo "🌐 Service Endpoints:"
echo "   Kong Edge Gateway:            http://143.244.137.224:8000"
echo "   Kong Admin API:               http://143.244.137.224:8001"
echo "   Kong Config Service:          http://143.244.137.224:8021"
echo "   API Composition Gateway:      http://143.244.137.224:8022"
echo "   GraphQL Federation Gateway:   http://143.244.137.224:8023"
echo "   Frontend Dashboard:           http://143.244.137.224:3000"
echo "   Keycloak IAM:                 http://143.244.137.224:8080"
echo ""
echo "🎯 Presentation Dashboards (all via Kong on port 8000):"
echo "   Kong Gateway Console:    http://143.244.137.224:3000/dashboard/kong-gateway"
echo "   API Composition:         http://143.244.137.224:3000/dashboard/api-composition"
echo "   GraphQL Federation:      http://143.244.137.224:3000/dashboard/graphql-gateway"
echo ""
echo "🔒 Architecture: Frontend → Next.js Proxy → Kong:8000 → Gateway Services"
echo ""
echo "🔑 Demo Credentials:"
echo "   👨‍⚕️ Clinical User:     username: dr.smith        | password: medtrust2026"
echo "   👩‍⚕️ Nurse:             username: nurse.joy       | password: medtrust2026"
echo "   🧑‍⚕️ ICU Specialist:    username: icu.dr.jones    | password: medtrust2026"
echo "   🛡️ Admin:             username: admin           | password: keycloak_admin_2026"
echo "===================================================="
