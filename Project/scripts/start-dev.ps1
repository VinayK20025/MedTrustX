# MedTrustX - Tier 2: Dev Environment (~10GB RAM)
# Core + key clinical/operational services + frontend

Write-Host "`n>>> Starting MedTrust Dev (Tier 2 - ~10GB RAM)..." -ForegroundColor Cyan

$env:PATH = "C:\Program Files\Docker\Docker\resources\bin;$env:PATH"

# Start core first
& "$PSScriptRoot\start-core.ps1"

Write-Host "`nAdding dev services..." -ForegroundColor Yellow

docker compose up -d `
  patient-service clinical-service diagnostics-service pharmacy-service `
  nursing-service medical-records-service `
  appointment-service billing-service order-service `
  audit-service compliance-service `
  minio frontend

Write-Host "`n[OK] Dev environment started." -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Kong API: http://localhost:8000" -ForegroundColor White
Write-Host "   Keycloak: http://localhost:8080" -ForegroundColor White
