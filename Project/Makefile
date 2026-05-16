# MedTrustX DHOS — Makefile
# Usage: make <target>

.PHONY: core dev clinical full stop logs health certs clean ps

# ─── Tiered Startup ──────────────────────────────────────────
core: ## Tier 1 (~5GB): Databases + IAM + Gateway
	@echo "🚀 Starting MedTrust Core Infrastructure..."
	docker compose up -d pg-clinical pg-operational pg-iam pg-analytics pg-telemed \
		redis redpanda redpanda-console \
		keycloak opa vault step-ca \
		kong gateway-service iam-service zta-service

dev: ## Tier 2 (~10GB): Core + key clinical/operational services
	@echo "🚀 Starting MedTrust Dev Environment..."
	$(MAKE) core
	docker compose up -d \
		patient-service clinical-service diagnostics-service pharmacy-service \
		appointment-service billing-service audit-service compliance-service \
		nursing-service medical-records-service order-service \
		minio frontend

clinical: ## Tier 3 (~16GB): All clinical + integrations
	@echo "🚀 Starting MedTrust Clinical Environment..."
	$(MAKE) dev
	docker compose up -d \
		ot-service icu-service blood-bank-service infection-control-service \
		devices-service ai-service analytics-service \
		er-service bed-management-service hr-service facilities-service \
		inventory-service telemedicine-service notification-service \
		management-service marketing-service legal-service transplant-service \
		threat-detection-service \
		hapi-fhir orthanc emqx

full: ## Tier 4 (~22GB): Everything
	@echo "🚀 Starting MedTrust Full Stack..."
	docker compose up -d

stop: ## Stop all containers
	@echo "🛑 Stopping all MedTrust services..."
	docker compose down

destroy: ## Stop + remove volumes (DATA LOSS!)
	@echo "💀 Destroying all MedTrust data..."
	docker compose down -v --remove-orphans

logs: ## Tail logs for all running services
	docker compose logs -f --tail=50

logs-%: ## Tail logs for specific service (e.g., make logs-patient-service)
	docker compose logs -f --tail=100 $*

ps: ## Show running containers
	docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

health: ## Run health checks
	@echo "🏥 Running MedTrust Health Checks..."
	@powershell -ExecutionPolicy Bypass -File scripts/health-check.ps1 2>/dev/null || bash scripts/health-check.sh

build: ## Build all service images
	docker compose build --parallel

build-%: ## Build specific service (e.g., make build-patient-service)
	docker compose build $*

restart-%: ## Restart specific service
	docker compose restart $*

shell-%: ## Open shell in container (e.g., make shell-patient-service)
	docker compose exec $* sh

db-clinical: ## Connect to clinical PostgreSQL
	docker compose exec pg-clinical psql -U $(PG_CLINICAL_USER) -d patients_db

db-operational: ## Connect to operational PostgreSQL
	docker compose exec pg-operational psql -U $(PG_OPERATIONAL_USER) -d scheduling_db

db-iam: ## Connect to IAM PostgreSQL
	docker compose exec pg-iam psql -U $(PG_IAM_USER) -d iam_db

redis-cli: ## Connect to Redis
	docker compose exec redis redis-cli -a $(REDIS_PASSWORD)

help: ## Show this help
	@grep -E '^[a-zA-Z_%-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
