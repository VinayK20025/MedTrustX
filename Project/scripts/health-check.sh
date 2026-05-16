#!/bin/bash
# MedTrustX DHOS — Health Check Script (Bash/WSL)

set -e
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "\n${CYAN}========================================"
echo "  MedTrustX DHOS — Health Check"
echo -e "========================================${NC}\n"

PASS=0; FAIL=0; SKIP=0

check_url() {
  local name=$1 url=$2
  if curl -sf --max-time 5 "$url" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ $name${NC}"; ((PASS++))
  else
    local container=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
    if docker compose ps --format "{{.Name}}" 2>/dev/null | grep -qi "$container"; then
      echo -e "  ${RED}❌ $name${NC}"; ((FAIL++))
    else
      echo -e "  ${YELLOW}⏭️  $name (not running)${NC}"; ((SKIP++))
    fi
  fi
}

check_cmd() {
  local name=$1; shift
  if "$@" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ $name${NC}"; ((PASS++))
  else
    echo -e "  ${RED}❌ $name${NC}"; ((FAIL++))
  fi
}

# Infrastructure
check_cmd "PostgreSQL Clinical" docker compose exec -T pg-clinical pg_isready -U postgres
check_cmd "PostgreSQL Operational" docker compose exec -T pg-operational pg_isready -U postgres
check_cmd "PostgreSQL IAM" docker compose exec -T pg-iam pg_isready -U postgres
check_cmd "PostgreSQL Analytics" docker compose exec -T pg-analytics pg_isready -U postgres
check_cmd "PostgreSQL Telemed" docker compose exec -T pg-telemed pg_isready -U postgres
check_cmd "Redis" docker compose exec -T redis redis-cli -a redis_secret_2026 ping

# Services
check_url "Redpanda" "http://localhost:9644/v1/status/ready"
check_url "Keycloak" "http://localhost:8080/health/ready"
check_url "OPA" "http://localhost:8181/health"
check_url "Vault" "http://localhost:8200/v1/sys/health"
check_url "Kong Gateway" "http://localhost:8001/status"
check_url "Prometheus" "http://localhost:9090/-/ready"
check_url "Grafana" "http://localhost:3100/api/health"
check_url "Jaeger" "http://localhost:16686/"
check_url "HAPI FHIR" "http://localhost:8090/fhir/metadata"
check_url "MinIO" "http://localhost:9000/minio/health/live"
check_url "EMQX" "http://localhost:18083/api/v5/status"
check_url "Gitea" "http://localhost:3300/api/v1/version"
check_url "SonarQube" "http://localhost:9900/api/system/status"

echo -e "\n${CYAN}────────────────────────────────────────"
echo -e "  Results: $PASS passed, $FAIL failed, $SKIP skipped"
echo -e "────────────────────────────────────────${NC}\n"
