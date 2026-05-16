# MedTrustX - Health Check Utility

Write-Host ">>> Running MedTrustX Health Checks..." -ForegroundColor Cyan
Write-Host "======================================"

$env:PATH = "C:\Program Files\Docker\Docker\resources\bin;$env:PATH"

# Check Docker containers
Write-Host "`n[1] Checking Docker Container Status:" -ForegroundColor Yellow
docker compose ps | Select-String -Pattern "Up|Exit|running|exited"

# Endpoints to check
$endpoints = @{
    "Frontend"     = "http://localhost:3000"
    "Kong Gateway" = "http://localhost:8000"
    "Keycloak"     = "http://localhost:8080/health/ready"
    "Grafana"      = "http://localhost:3100/api/health"
    "Prometheus"   = "http://localhost:9090/-/healthy"
}

Write-Host "`n[2] Checking Core Endpoints:" -ForegroundColor Yellow

foreach ($service in $endpoints.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest -Uri $service.Value -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "[OK] $($service.Name) is reachable" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] $($service.Name) is NOT reachable ($($_.Exception.Message))" -ForegroundColor Red
    }
}

Write-Host "`nHealth check complete!" -ForegroundColor White
