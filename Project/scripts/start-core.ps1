# MedTrustX - Tier 1: Core Infrastructure (~5GB RAM)
# Databases, IAM, Gateway, ZTA essentials

Write-Host "`n>>> Starting MedTrust Core (Tier 1 - ~5GB RAM)..." -ForegroundColor Cyan

$env:PATH = "C:\Program Files\Docker\Docker\resources\bin;$env:PATH"

docker compose up -d `
  pg-clinical pg-operational pg-iam pg-analytics pg-telemed `
  redis redpanda redpanda-console `
  keycloak opa vault step-ca `
  kong gateway-service iam-service zta-service

Write-Host "`nWaiting for databases to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n[OK] Core infrastructure started. Run health check:" -ForegroundColor Green
Write-Host "   .\scripts\health-check.ps1" -ForegroundColor White
