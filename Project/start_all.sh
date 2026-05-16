#!/bin/bash

# MedTrustX — Single-Script Startup
# Starts infrastructure, gateway, backends, and frontend.

echo "=========================================================="
echo " Starting MedTrustX Digital Hospital Operating System"
echo "=========================================================="

# Cleanup function to kill background processes on exit
function cleanup {
  echo ""
  echo "Shutting down services..."
  kill $(jobs -p) 2>/dev/null
  docker compose down
  echo "MedTrustX gracefully shut down."
  exit
}
trap cleanup EXIT INT TERM

# 1. Start Infrastructure
echo "[1/4] Starting infrastructure (Docker Compose)..."
docker compose up -d pg-clinical pg-operational pg-iam redis redpanda kong keycloak
echo "Waiting for infrastructure to be ready..."
sleep 15

# 2. Start Gateway Service (Node.js)
echo "[2/4] Starting Gateway Service..."
cd services/gateway-service
if [ ! -d "node_modules" ]; then
  echo "Installing Gateway dependencies..."
  npm install
fi
npm run start:dev > ../../gateway.log 2>&1 &
cd ../..

# 3. Start Core Backend Services (Python)
echo "[3/4] Starting Core Backend Microservices..."
python3 run_backends.py --include patient,clinical,billing,appointment,beds,iam,analytics --max 7 > backends.log 2>&1 &
echo "Waiting for backends to initialize..."
sleep 10

# 4. Start Frontend (Next.js)
echo "[4/4] Starting Frontend App..."
cd frontend
if [ ! -d "node_modules" ]; then
  echo "Installing Frontend dependencies..."
  npm install
fi
npm run dev > ../frontend.log 2>&1 &
cd ..

echo "=========================================================="
echo " All services started!"
echo ""
echo " Frontend:        http://143.244.137.224:3000"
echo " API Gateway:     http://143.244.137.224:8000"
echo " Event Gateway:   ws://143.244.137.224:4001/ws/events"
echo " Keycloak:        http://143.244.137.224:8080"
echo ""
echo " Logs:"
echo " - Gateway:  tail -f gateway.log"
echo " - Backends: tail -f backends.log"
echo " - Frontend: tail -f frontend.log"
echo "=========================================================="
echo "Press Ctrl+C to stop all services."

# Wait indefinitely to keep the background processes alive until Ctrl+C
wait
