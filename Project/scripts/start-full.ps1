# MedTrustX - Tier 4: Full Stack (~22GB RAM)
# Everything including monitoring, DevSecOps, AI/ML

Write-Host "`n>>> Starting MedTrust Full Stack (Tier 4 - ~22GB RAM)..." -ForegroundColor Cyan
Write-Host "[WARNING] Requires ~22GB RAM. You have 24GB total." -ForegroundColor Yellow

$env:PATH = "C:\Program Files\Docker\Docker\resources\bin;$env:PATH"

docker compose up -d

Write-Host "`n[OK] Full stack started. All 71 containers." -ForegroundColor Green
Write-Host ""
Write-Host "   [Dashboards]" -ForegroundColor Cyan
Write-Host "      Frontend:   http://localhost:3000"
Write-Host "      Kong:       http://localhost:8001"
Write-Host "      Keycloak:   http://localhost:8080"
Write-Host "      Grafana:    http://localhost:3100"
Write-Host "      Prometheus: http://localhost:9090"
Write-Host "      Jaeger:     http://localhost:16686"
Write-Host "      Redpanda:   http://localhost:8082"
Write-Host "      MinIO:      http://localhost:9001"
Write-Host "      EMQX:       http://localhost:18083"
Write-Host "      Gitea:      http://localhost:3300"
Write-Host "      SonarQube:  http://localhost:9900"
Write-Host "      FHIR:       http://localhost:8090"
Write-Host "      Orthanc:    http://localhost:8042"
Write-Host "      MLflow:     http://localhost:5050"
Write-Host ""
